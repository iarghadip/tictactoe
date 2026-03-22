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

function saveGame(nk, logger, userA, userB, winnerId) {
    try {
        nk.sqlExec(
            'INSERT INTO games (id, user_a, user_b, winner) VALUES ($1, $2, $3, $4)',
            [nk.uuidv4(), userA, userB, winnerId]
        );
        logger.info('Game saved. user_a: %s user_b: %s winner: %s', userA, userB, winnerId || 'draw');
    } catch (e) {
        logger.error('Failed to save game. user_a: %s user_b: %s winner: %s error: %s', userA, userB, winnerId || 'draw', e.message);
    }
}

var matchmakerMatched = function (ctx, logger, nk, matches) {
    logger.info('Matchmaker matched: %s vs %s', matches[0].presence.username, matches[1].presence.username);
    var matchId = nk.matchCreate('tictactoe', {});
    logger.info('Match created: %s', matchId);
    return matchId;
};

var matchInit = function (ctx, logger, nk, params) {
    logger.info('matchInit called. matchId: %s', ctx.matchId);
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
        },
        tickRate: 1,
        label: 'tictactoe',
    };
};

var matchJoinAttempt = function (ctx, logger, nk, dispatcher, tick, state, presence, metadata) {
    var isReconnect = state.disconnectedPlayers[presence.userId] !== undefined;
    var accepted = isReconnect || Object.keys(state.marks).length < 2;
    logger.info('matchJoinAttempt. userId: %s accepted: %s isReconnect: %s', presence.userId, accepted, isReconnect);
    return { state: state, accept: accepted };
};

var matchJoin = function (ctx, logger, nk, dispatcher, tick, state, presences) {
    presences.forEach(function (p) {
        if (state.disconnectedPlayers[p.userId] !== undefined) {
            delete state.disconnectedPlayers[p.userId];
            logger.info('Player reconnected. userId: %s', p.userId);
            dispatcher.broadcastMessage(SERVER_OPCODE.OPPONENT_RECONNECTED, JSON.stringify({}));
            return;
        }

        if (!state.marks[p.userId]) {
            var mark = Object.keys(state.marks).length === 0 ? 'O' : 'X';
            state.marks[p.userId] = mark;

            var users = nk.usersGetId([p.userId]);
            var displayName = (users && users[0] && users[0].displayName) ? users[0].displayName : 'Anonymous';
            state.players[mark] = displayName;

            logger.info('Player joined. userId: %s displayName: %s mark: %s', p.userId, displayName, mark);
        }
    });

    logger.info('matchJoin. playerCount: %s', Object.keys(state.marks).length);

    if (Object.keys(state.marks).length === 2 && state.status === 'waiting') {
        state.currentTurn = Object.keys(state.marks)[0];
        state.status = 'ready';
        logger.info('Both players joined. firstTurn: %s', state.currentTurn);
    }

    return { state: state };
};

var matchLeave = function (ctx, logger, nk, dispatcher, tick, state, presences) {
    presences.forEach(function (p) {
        logger.warn('Player left. userId: %s matchId: %s', p.userId, ctx.matchId);

        if (state.status === 'playing' || state.status === 'ready') {
            state.disconnectedPlayers[p.userId] = tick;
            logger.info('Player disconnected. userId: %s gracePeriod: %s', p.userId, DISCONNECT_GRACE);
            dispatcher.broadcastMessage(SERVER_OPCODE.OPPONENT_DISCONNECTED, JSON.stringify({
                gracePeriod: DISCONNECT_GRACE,
            }));
        } else if (state.status === 'finished' && Object.keys(state.marks).length === 2) {
            logger.info('Player left after finished game. userId: %s sending MATCH_ENDED', p.userId);
            dispatcher.broadcastMessage(SERVER_OPCODE.MATCH_ENDED, JSON.stringify({}));
        }
    });

    return { state: state };
};

var matchLoop = function (ctx, logger, nk, dispatcher, tick, state, messages) {
    if (state.status === 'ready') {
        state.status = 'playing';
        state.turnStartTick = tick;
        logger.info('Broadcasting GAME_START. marks: %s players: %s currentTurn: %s', JSON.stringify(state.marks), JSON.stringify(state.players), state.currentTurn);
        dispatcher.broadcastMessage(SERVER_OPCODE.GAME_START, JSON.stringify({
            marks: state.marks,
            players: state.players,
            currentTurn: state.currentTurn,
            board: state.board,
            timeLeft: TURN_LIMIT,
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
                logger.info('Disconnect grace expired. dcId: %s winnerId: %s', dcId, winnerId);
                if (state.status === 'playing' && playerIds.length === 2) {
                    saveGame(nk, logger, playerIds[0], playerIds[1], winnerId);
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

        logger.info('Message received. opCode: %s senderId: %s data: %s', opcode, senderId, JSON.stringify(data));

        if (opcode === CLIENT_OPCODE.MOVE) {
            if (state.status !== 'playing') {
                logger.warn('Move rejected. reason: game not playing. status: %s', state.status);
                return;
            }
            if (senderId !== state.currentTurn) {
                logger.warn('Move rejected. reason: not your turn. senderId: %s currentTurn: %s', senderId, state.currentTurn);
                return;
            }

            var pos = data.position;
            if (pos < 0 || pos > 8 || state.board[pos] !== '') {
                logger.warn('Move rejected. reason: invalid position. pos: %s board[pos]: %s', pos, state.board[pos]);
                return;
            }

            state.board[pos] = state.marks[senderId];
            state.moveCount++;
            logger.info('Move applied. senderId: %s pos: %s mark: %s moveCount: %s', senderId, pos, state.marks[senderId], state.moveCount);

            var result = checkWinner(state.board);

            if (result) {
                state.status = 'finished';
                state.turnStartTick = null;
                var playerIds = Object.keys(state.marks);
                logger.info('Game over. winner mark: %s winnerId: %s', result.winner, senderId);
                saveGame(nk, logger, playerIds[0], playerIds[1], senderId);
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
                logger.info('Game over. result: draw');
                saveGame(nk, logger, playerIds[0], playerIds[1], null);
                dispatcher.broadcastMessage(SERVER_OPCODE.GAME_OVER, JSON.stringify({
                    board: state.board,
                    winner: null,
                    combo: null,
                }));
                return;
            }

            state.currentTurn = Object.keys(state.marks).find(function (id) { return id !== senderId; });
            state.turnStartTick = tick;
            logger.info('Turn switched. nextTurn: %s', state.currentTurn);
            dispatcher.broadcastMessage(SERVER_OPCODE.GAME_STATE, JSON.stringify({
                board: state.board,
                currentTurn: state.currentTurn,
                timeLeft: TURN_LIMIT,
            }));
        }

        if (opcode === CLIENT_OPCODE.REMATCH_VOTE) {
            state.rematchVotes[senderId] = true;
            logger.info('Rematch vote. senderId: %s votes: %s/%s', senderId, Object.keys(state.rematchVotes).length, Object.keys(state.marks).length);

            dispatcher.broadcastMessage(SERVER_OPCODE.REMATCH_VOTED, JSON.stringify({
                userId: senderId,
            }));

            var allVoted = Object.keys(state.marks).every(function (id) {
                return state.rematchVotes[id] === true;
            });

            if (allVoted) {
                state.board = makeInitialBoard();
                state.moveCount = 0;
                state.rematchVotes = {};
                state.status = 'playing';
                state.currentTurn = Object.keys(state.marks)[0];
                state.turnStartTick = tick;
                logger.info('Rematch started. firstTurn: %s', state.currentTurn);
                dispatcher.broadcastMessage(SERVER_OPCODE.REMATCH_START, JSON.stringify({
                    board: state.board,
                    currentTurn: state.currentTurn,
                    timeLeft: TURN_LIMIT,
                }));
            }
        }

        if (opcode === CLIENT_OPCODE.LEAVE) {
            logger.info('Player requested leave. senderId: %s', senderId);
            if (state.status === 'playing') {
                var playerIds = Object.keys(state.marks);
                var winnerId = playerIds.find(function (id) { return id !== senderId; });
                saveGame(nk, logger, playerIds[0], playerIds[1], winnerId);
            }
            state.status = 'finished';
            state.turnStartTick = null;
            dispatcher.broadcastMessage(SERVER_OPCODE.MATCH_ENDED, JSON.stringify({}));
        }
    });

    if (state.status === 'playing' && state.turnStartTick !== null && disconnectedIds.length === 0) {
        var elapsed = tick - state.turnStartTick;
        var timeLeft = TURN_LIMIT - elapsed;

        if (timeLeft <= 0) {
            var playerIds = Object.keys(state.marks);
            var timedOutId = state.currentTurn;
            var winnerId = playerIds.find(function (id) { return id !== timedOutId; });
            var winnerMark = state.marks[winnerId];
            state.status = 'finished';
            state.turnStartTick = null;
            logger.info('Turn timeout. timedOutId: %s winnerId: %s winnerMark: %s', timedOutId, winnerId, winnerMark);
            saveGame(nk, logger, playerIds[0], playerIds[1], winnerId);
            dispatcher.broadcastMessage(SERVER_OPCODE.GAME_OVER, JSON.stringify({
                board: state.board,
                winner: winnerMark,
                combo: null,
            }));
            return { state: state };
        }

        dispatcher.broadcastMessage(SERVER_OPCODE.TIMER_UPDATE, JSON.stringify({
            timeLeft: timeLeft,
        }));
    }

    return { state: state };
};

var matchSignal = function (ctx, logger, nk, dispatcher, tick, state, data) {
    logger.info('matchSignal received. data: %s', data);
    return { state: state, data: '' };
};

var matchTerminate = function (ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
    logger.info('matchTerminate called. graceSeconds: %s', graceSeconds);
    dispatcher.broadcastMessage(SERVER_OPCODE.MATCH_ENDED, JSON.stringify({}));
    return { state: state };
};

var InitModule = function (ctx, logger, nk, initializer) {
    try {
        nk.sqlExec(`
            CREATE TABLE IF NOT EXISTS games (
                id           TEXT      PRIMARY KEY,
                created_at   TIMESTAMP DEFAULT NOW(),
                completed_at TIMESTAMP DEFAULT NULL,
                user_a       UUID      REFERENCES users(id),
                user_b       UUID      REFERENCES users(id),
                winner       UUID      REFERENCES users(id) DEFAULT NULL
            );
        `, []);
        logger.info('Tables ready.');
    } catch (e) {
        logger.error('Failed to create tables: %s', e.message);
    }

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