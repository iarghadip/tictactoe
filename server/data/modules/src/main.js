var WIN_COMBOS = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6],
];

var SERVER_OPCODE = {
    GAME_START: 11,
    GAME_STATE: 12,
    GAME_OVER: 13,
    REMATCH_START: 14,
    MATCH_ENDED: 15,
    REMATCH_VOTED: 16,
    TIMER_UPDATE: 17,
    OPPONENT_DISCONNECTED: 18,
    OPPONENT_RECONNECTED: 19,
};

var CLIENT_OPCODE = {
    MOVE: 21,
    REMATCH_VOTE: 22,
    LEAVE: 23,
};

var TURN_LIMIT = 30;
var DISCONNECT_GRACE = 60;
var ROOM_LIMIT = 25;

var LEADERBOARD_ID = "tictactoe";

function checkWinner(board) {
    for (var i = 0; i < WIN_COMBOS.length; i++) {
        var a = WIN_COMBOS[i][0], b = WIN_COMBOS[i][1], c = WIN_COMBOS[i][2];
        if (board[a] !== '' && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], combo: WIN_COMBOS[i] };
        }
    }
    return null;
}

function makeInitialBoard() {
    return ['', '', '', '', '', '', '', '', ''];
}

function updatePlayerStats(nk, logger, userId, result) {
    var collection = "player_stats";
    var key = "tictactoe_stats";
    var stats = { wins: 0, losses: 0, matches: 0 };

    try {
        var records = nk.storageRead([{ collection: collection, key: key, userId: userId }]);
        if (records.length > 0) {
            stats = records[0].value;
        }
    } catch (e) {
        logger.error('Failed to read stats for %s: %s', userId, e.message);
    }

    stats.matches += 1;
    if (result === 'win') {
        stats.wins += 1;
    } else if (result === 'loss') {
        stats.losses += 1;
    }

    try {
        nk.storageWrite([{
            collection: collection,
            key: key,
            userId: userId,
            value: stats,
            permissionRead: 2,
            permissionWrite: 0
        }]);
    } catch (e) {
        logger.error('Failed to write stats for %s: %s', userId, e.message);
    }

    return stats;
}

function updateLeaderboard(nk, logger, winnerId, winnerName, loserId, loserName) {
    var winnerStats = updatePlayerStats(nk, logger, winnerId, 'win');
    var loserStats = updatePlayerStats(nk, logger, loserId, 'loss');

    try {
        nk.leaderboardRecordWrite(LEADERBOARD_ID, winnerId, winnerName, 75, 0, winnerStats);
        nk.leaderboardRecordWrite(LEADERBOARD_ID, loserId, loserName, -25, 0, loserStats);
        logger.info('Leaderboard updated. Winner: %s, Loser: %s', winnerId, loserId);
    } catch (e) {
        logger.error('Failed to update leaderboard: %s', e.message);
    }
}

var rpcCreateRoom = function (ctx, logger, nk, payload) {

    var name = payload || '';
    
    try {
        name = JSON.parse(name);
    } catch (e) {
        
    }

    name = (typeof name === 'string' ? name : '').trim();

    if (!name) {
        throw new Error('Room name is required.');
    }

    var userId = ctx.userId;
    var totalCount = 0;
    try {
        var cursor = undefined;
        do {
            var result = nk.userGroupsList(userId, 100, null, cursor);
            var groups = result.userGroups || [];
            totalCount += groups.length;
            cursor = result.cursor || undefined;
        } while (cursor);
    } catch (e) {
        logger.error('rpcCreateRoom: failed to list groups for %s: %s', userId, e.message);
        throw new Error('Failed to check room count.');
    }

    if (totalCount >= ROOM_LIMIT) {
        throw new Error('You can only join or create up to ' + ROOM_LIMIT + ' rooms.');
    }

    var group;
    try {
        group = nk.groupCreate(userId, name, userId, null, null, null, false, {}, 100);
    } catch (e) {
        logger.error('rpcCreateRoom: failed to create group "%s": %s', name, e.message);
        throw new Error(e.message || 'Room name already exists!');
    }

    logger.info('rpcCreateRoom: user %s created room "%s" (%s)', userId, name, group.id);
    return JSON.stringify({ groupId: group.id });
};

var beforeJoinGroup = function (ctx, logger, nk, data) {
    var userId = ctx.userId;
    var totalCount = 0;
    var cursor = undefined;

    try {
        do {
            var result = nk.userGroupsList(userId, 100, null, cursor);
            var groups = result.userGroups || [];
            totalCount += groups.length;
            cursor = result.cursor || undefined;
        } while (cursor);
    } catch (e) {
        logger.error('beforeJoinGroup: failed to list groups for %s: %s', userId, e.message);
        throw new Error('Failed to check room count.');
    }

    if (totalCount >= ROOM_LIMIT) {
        throw new Error('You cannot join or request more than ' + ROOM_LIMIT + ' rooms.');
    }

    return data;
};

var matchmakerMatched = function (ctx, logger, nk, matches) {
    logger.info('Matchmaker matched: %s vs %s', matches[0].presence.username, matches[1].presence.username);
    var properties = matches[0].stringProperties || matches[0].properties || {};
    var mode = properties.mode || 'timed';
    var matchId = nk.matchCreate('tictactoe', { mode: mode });
    logger.info('Match created: %s mode: %s', matchId, mode);
    return matchId;
};

var matchInit = function (ctx, logger, nk, params) {
    logger.info('matchInit called. matchId: %s', ctx.matchId);
    var mode = (params && params.mode) ? params.mode : 'timed';
    return {
        state: {
            board: makeInitialBoard(),
            marks: {},
            players: {},
            currentTurn: null,
            moveCount: 0,
            rematchVotes: {},
            status: 'waiting',
            turnStartTick: null,
            disconnectedPlayers: {},
            mode: mode,
        },
        tickRate: 1,
        label: 'tictactoe',
    };
};

var matchJoinAttempt = function (ctx, logger, nk, dispatcher, tick, state, presence, metadata) {
    var isReconnect = state.disconnectedPlayers[presence.userId] !== undefined;
    var accepted = isReconnect || Object.keys(state.marks).length < 2;
    return { state: state, accept: accepted };
};

var matchJoin = function (ctx, logger, nk, dispatcher, tick, state, presences) {
    presences.forEach(function (p) {
        if (state.disconnectedPlayers[p.userId] !== undefined) {
            delete state.disconnectedPlayers[p.userId];
            dispatcher.broadcastMessage(SERVER_OPCODE.OPPONENT_RECONNECTED, JSON.stringify({}));
            return;
        }

        if (!state.marks[p.userId]) {
            var mark = Object.keys(state.marks).length === 0 ? 'O' : 'X';
            state.marks[p.userId] = mark;

            var users = nk.usersGetId([p.userId]);
            var displayName = (users && users[0] && users[0].displayName) ? users[0].displayName : 'Anonymous';
            state.players[mark] = displayName;
        }
    });

    if (Object.keys(state.marks).length === 2 && state.status === 'waiting') {
        state.currentTurn = Object.keys(state.marks)[0];
        state.status = 'ready';
    }

    return { state: state };
};

var matchLeave = function (ctx, logger, nk, dispatcher, tick, state, presences) {
    presences.forEach(function (p) {
        if (state.status === 'playing' || state.status === 'ready') {
            state.disconnectedPlayers[p.userId] = tick;
            dispatcher.broadcastMessage(SERVER_OPCODE.OPPONENT_DISCONNECTED, JSON.stringify({
                gracePeriod: DISCONNECT_GRACE,
            }));
        } else if (state.status === 'finished' && Object.keys(state.marks).length === 2) {
            dispatcher.broadcastMessage(SERVER_OPCODE.MATCH_ENDED, JSON.stringify({}));
        }
    });

    return { state: state };
};

var matchLoop = function (ctx, logger, nk, dispatcher, tick, state, messages) {
    if (state.status === 'ready') {
        state.status = 'playing';
        if (state.mode === 'timed') {
            state.turnStartTick = tick;
        }

        dispatcher.broadcastMessage(SERVER_OPCODE.GAME_START, JSON.stringify({
            marks: state.marks,
            players: state.players,
            currentTurn: state.currentTurn,
            board: state.board,
            timeLeft: TURN_LIMIT,
            scores: { O: 0, X: 0 },
            mode: state.mode,
        }));
        return { state: state };
    }

    var disconnectedIds = Object.keys(state.disconnectedPlayers);

    if (disconnectedIds.length > 0 && (state.status === 'playing' || state.status === 'ready')) {
        for (var d = 0; d < disconnectedIds.length; d++) {
            var dcId = disconnectedIds[d];
            var dcTick = state.disconnectedPlayers[dcId];
            var dcElapsed = tick - dcTick;

            if (dcElapsed >= DISCONNECT_GRACE) {
                var playerIds = Object.keys(state.marks);
                var winnerId = playerIds.find(function (id) { return id !== dcId; });

                if (state.status === 'playing' && playerIds.length === 2) {
                    var winnerName = state.players[state.marks[winnerId]];
                    var loserName = state.players[state.marks[dcId]];
                    updateLeaderboard(nk, logger, winnerId, winnerName, dcId, loserName);
                }

                state.status = 'finished';
                state.turnStartTick = null;
                dispatcher.broadcastMessage(SERVER_OPCODE.MATCH_ENDED, JSON.stringify({}));
                return { state: state };
            }
        }
        return { state: state };
    }

    messages.forEach(function (msg) {
        var senderId = msg.sender.userId;
        var opcode = msg.opCode;
        var data = JSON.parse(nk.binaryToString(msg.data));

        if (opcode === CLIENT_OPCODE.MOVE) {
            if (state.status !== 'playing' || senderId !== state.currentTurn) return;

            var pos = data.position;
            if (pos < 0 || pos > 8 || state.board[pos] !== '') return;

            state.board[pos] = state.marks[senderId];
            state.moveCount++;

            var result = checkWinner(state.board);

            if (result) {
                state.status = 'finished';
                state.turnStartTick = null;
                var playerIds = Object.keys(state.marks);
                var loserId = playerIds.find(function (id) { return id !== senderId; });

                var winnerName = state.players[state.marks[senderId]];
                var loserName = state.players[state.marks[loserId]];
                updateLeaderboard(nk, logger, senderId, winnerName, loserId, loserName);

                dispatcher.broadcastMessage(SERVER_OPCODE.GAME_OVER, JSON.stringify({
                    board: state.board,
                    winner: result.winner,
                    combo: result.combo,
                }));
                return;
            }

            if (state.moveCount === 9) {
                state.status = 'finished';
                state.turnStartTick = null;

                var playerIds = Object.keys(state.marks);
                updatePlayerStats(nk, logger, playerIds[0], 'draw');
                updatePlayerStats(nk, logger, playerIds[1], 'draw');

                dispatcher.broadcastMessage(SERVER_OPCODE.GAME_OVER, JSON.stringify({
                    board: state.board,
                    winner: null,
                    combo: null,
                }));
                return;
            }

            state.currentTurn = Object.keys(state.marks).find(function (id) { return id !== senderId; });
            if (state.mode === 'timed') {
                state.turnStartTick = tick;
            }
            dispatcher.broadcastMessage(SERVER_OPCODE.GAME_STATE, JSON.stringify({
                board: state.board,
                currentTurn: state.currentTurn,
                timeLeft: TURN_LIMIT,
            }));
        }

        if (opcode === CLIENT_OPCODE.REMATCH_VOTE) {
            state.rematchVotes[senderId] = true;
            dispatcher.broadcastMessage(SERVER_OPCODE.REMATCH_VOTED, JSON.stringify({ userId: senderId }));

            var allVoted = Object.keys(state.marks).every(function (id) {
                return state.rematchVotes[id] === true;
            });

            if (allVoted) {
                state.board = makeInitialBoard();
                state.moveCount = 0;
                state.rematchVotes = {};
                state.status = 'playing';
                state.currentTurn = Object.keys(state.marks)[0];
                if (state.mode === 'timed') {
                    state.turnStartTick = tick;
                }
                dispatcher.broadcastMessage(SERVER_OPCODE.REMATCH_START, JSON.stringify({
                    board: state.board,
                    currentTurn: state.currentTurn,
                    timeLeft: TURN_LIMIT,
                }));
            }
        }

        if (opcode === CLIENT_OPCODE.LEAVE) {
            if (state.status === 'playing') {
                var playerIds = Object.keys(state.marks);
                var winnerId = playerIds.find(function (id) { return id !== senderId; });

                var winnerName = state.players[state.marks[winnerId]];
                var loserName = state.players[state.marks[senderId]];
                updateLeaderboard(nk, logger, winnerId, winnerName, senderId, loserName);
            }
            state.status = 'finished';
            state.turnStartTick = null;
            dispatcher.broadcastMessage(SERVER_OPCODE.MATCH_ENDED, JSON.stringify({}));
        }
    });

    if (state.mode === 'timed' && state.status === 'playing' && state.turnStartTick !== null && disconnectedIds.length === 0) {
        var elapsed = tick - state.turnStartTick;
        var timeLeft = TURN_LIMIT - elapsed;

        if (timeLeft <= 0) {
            var playerIds = Object.keys(state.marks);
            var timedOutId = state.currentTurn;
            var winnerId = playerIds.find(function (id) { return id !== timedOutId; });
            var winnerMark = state.marks[winnerId];
            var winnerName = state.players[winnerMark];
            var loserName = state.players[state.marks[timedOutId]];
            updateLeaderboard(nk, logger, winnerId, winnerName, timedOutId, loserName);

            state.status = 'finished';
            state.turnStartTick = null;
            dispatcher.broadcastMessage(SERVER_OPCODE.GAME_OVER, JSON.stringify({
                board: state.board,
                winner: winnerMark,
                combo: null,
            }));
            return { state: state };
        }

        dispatcher.broadcastMessage(SERVER_OPCODE.TIMER_UPDATE, JSON.stringify({ timeLeft: timeLeft }));
    }

    return { state: state };
};

var matchSignal = function (ctx, logger, nk, dispatcher, tick, state, data) {
    return { state: state, data: '' };
};

var matchTerminate = function (ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
    dispatcher.broadcastMessage(SERVER_OPCODE.MATCH_ENDED, JSON.stringify({}));
    return { state: state };
};

var InitModule = function (ctx, logger, nk, initializer) {
    try {
        nk.leaderboardCreate(
            LEADERBOARD_ID,
            true,
            "desc",
            "incr",
            null,
            {}
        );
        logger.info('Leaderboard "%s" initialized.', LEADERBOARD_ID);
    } catch (e) {
        logger.error('Failed to initialize leaderboard: %s', e.message);
    }

    initializer.registerRpc('create_room', rpcCreateRoom);
    
    initializer.registerBeforeJoinGroup(beforeJoinGroup);

    initializer.registerMatchmakerMatched(matchmakerMatched);
    initializer.registerMatch('tictactoe', {
        matchInit: matchInit,
        matchJoinAttempt: matchJoinAttempt,
        matchJoin: matchJoin,
        matchLeave: matchLeave,
        matchLoop: matchLoop,
        matchSignal: matchSignal,
        matchTerminate: matchTerminate,
    });

    logger.info('Tic-Tac-Toe module loaded.');
};