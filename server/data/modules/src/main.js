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

function loadHistoricalScores(nk, logger, marks, playerIds) {
    var scores = { O: 0, X: 0 };
    try {
        var rows = nk.sqlQuery(
            'SELECT winner, COUNT(*) AS wins FROM games WHERE ((user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)) AND winner IS NOT NULL GROUP BY winner',
            [playerIds[0], playerIds[1]]
        );
        rows.forEach(function (row) {
            var mark = marks[row.winner];
            if (mark) {
                scores[mark] = parseInt(row.wins, 10);
            }
        });
        logger.info('Historical scores loaded. O: %s X: %s', scores.O, scores.X);
    } catch (e) {
        logger.error('Failed to load historical scores: %s', e.message);
    }
    return scores;
}

function saveGame(nk, logger, userA, userB, winnerId, loserId) {
    try {
        nk.sqlExec(
            'INSERT INTO games (id, user_a, user_b, winner, loser) VALUES ($1, $2, $3, $4, $5)',
            [nk.uuidv4(), userA, userB, winnerId || null, loserId || null]
        );
        logger.info('Game saved. user_a: %s user_b: %s winner: %s loser: %s', userA, userB, winnerId || 'draw', loserId || 'draw');
    } catch (e) {
        logger.error('Failed to save game. user_a: %s user_b: %s winner: %s loser: %s error: %s', userA, userB, winnerId || 'draw', loserId || 'draw', e.message);
    }
}

var getLeaderboard = function (ctx, logger, nk, payload) {
    var userId = ctx.userId;

    try {
        var top100 = nk.sqlQuery(`
            WITH ranked AS (
                SELECT
                    u.id,
                    COALESCE(u.display_name, 'Anonymous') AS display_name,
                    COUNT(CASE WHEN g.winner = u.id THEN 1 END)                                                           AS wins,
                    COUNT(CASE WHEN g.loser = u.id THEN 1 END)                                                            AS losses,
                    COUNT(CASE WHEN g.winner = u.id OR g.loser = u.id THEN 1 END)                                         AS matches,
                    COUNT(CASE WHEN g.winner = u.id THEN 1 END) * 100
                    - COUNT(CASE WHEN g.loser = u.id THEN 1 END) * 25                                                     AS score
                FROM users u
                INNER JOIN games g ON (g.winner = u.id OR g.loser = u.id)
                GROUP BY u.id, u.display_name
            ),
            ranked_with_rank AS (
                SELECT *, RANK() OVER (ORDER BY score DESC) AS rank
                FROM ranked
            )
            SELECT * FROM ranked_with_rank
            ORDER BY rank
            LIMIT 100
        `, []);

        var myStats = null;
        try {
            var myRows = nk.sqlQuery(`
                WITH ranked AS (
                    SELECT
                        u.id,
                        COALESCE(u.display_name, 'Anonymous') AS display_name,
                        COUNT(CASE WHEN g.winner = u.id THEN 1 END)                                                           AS wins,
                        COUNT(CASE WHEN g.loser = u.id THEN 1 END)                                                            AS losses,
                        COUNT(CASE WHEN g.winner = u.id OR g.loser = u.id THEN 1 END)                                         AS matches,
                        COUNT(CASE WHEN g.winner = u.id THEN 1 END) * 100
                        - COUNT(CASE WHEN g.loser = u.id THEN 1 END) * 25                                                     AS score
                    FROM users u
                    INNER JOIN games g ON (g.winner = u.id OR g.loser = u.id)
                    GROUP BY u.id, u.display_name
                ),
                ranked_with_rank AS (
                    SELECT *, RANK() OVER (ORDER BY score DESC) AS rank
                    FROM ranked
                )
                SELECT * FROM ranked_with_rank WHERE id = $1
            `, [userId]);

            if (myRows && myRows.length > 0) {
                var r = myRows[0];
                myStats = {
                    id: r.id,
                    display_name: r.display_name,
                    wins: parseInt(r.wins, 10),
                    losses: parseInt(r.losses, 10),
                    matches: parseInt(r.matches, 10),
                    score: parseInt(r.score, 10),
                    rank: parseInt(r.rank, 10),
                };
            }
        } catch (e) {
            logger.error('Failed to load my stats: %s', e.message);
        }

        var players = (top100 || []).map(function (r) {
            return {
                id: r.id,
                display_name: r.display_name,
                wins: parseInt(r.wins, 10),
                losses: parseInt(r.losses, 10),
                matches: parseInt(r.matches, 10),
                score: parseInt(r.score, 10),
                rank: parseInt(r.rank, 10),
            };
        });

        logger.info('Leaderboard fetched. top100count: %s myStats: %s', players.length, myStats ? 'found' : 'none');
        return JSON.stringify({ players: players, myStats: myStats });
    } catch (e) {
        logger.error('getLeaderboard failed: %s', e.message);
        return JSON.stringify({ players: [], myStats: null });
    }
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
    logger.info('Match mode: %s', mode);
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
            historicalScores: null,
            mode: mode,
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
        if (state.mode === 'timed') {
            state.turnStartTick = tick;
        }

        var playerIds = Object.keys(state.marks);
        state.historicalScores = loadHistoricalScores(nk, logger, state.marks, playerIds);

        logger.info('Broadcasting GAME_START. marks: %s players: %s currentTurn: %s mode: %s', JSON.stringify(state.marks), JSON.stringify(state.players), state.currentTurn, state.mode);
        dispatcher.broadcastMessage(SERVER_OPCODE.GAME_START, JSON.stringify({
            marks: state.marks,
            players: state.players,
            currentTurn: state.currentTurn,
            board: state.board,
            timeLeft: TURN_LIMIT,
            scores: state.historicalScores,
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
                logger.info('Disconnect grace expired. dcId: %s winnerId: %s', dcId, winnerId);
                if (state.status === 'playing' && playerIds.length === 2) {
                    saveGame(nk, logger, playerIds[0], playerIds[1], winnerId, dcId);
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
                var loserId = playerIds.find(function (id) { return id !== senderId; });
                logger.info('Game over. winner mark: %s winnerId: %s loserId: %s', result.winner, senderId, loserId);
                saveGame(nk, logger, playerIds[0], playerIds[1], senderId, loserId);
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
                saveGame(nk, logger, playerIds[0], playerIds[1], null, null);
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
                if (state.mode === 'timed') {
                    state.turnStartTick = tick;
                }
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
                saveGame(nk, logger, playerIds[0], playerIds[1], winnerId, senderId);
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
            state.status = 'finished';
            state.turnStartTick = null;
            logger.info('Turn timeout. timedOutId: %s winnerId: %s winnerMark: %s', timedOutId, winnerId, winnerMark);
            saveGame(nk, logger, playerIds[0], playerIds[1], winnerId, timedOutId);
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
                user_a       UUID      REFERENCES users(id),
                user_b       UUID      REFERENCES users(id),
                winner       UUID      REFERENCES users(id) DEFAULT NULL,
                loser        UUID      REFERENCES users(id) DEFAULT NULL
            );
        `, []);
        nk.sqlExec('CREATE INDEX IF NOT EXISTS idx_games_winner ON games(winner);', []);
        nk.sqlExec('CREATE INDEX IF NOT EXISTS idx_games_loser ON games(loser);', []);
        logger.info('Tables and indexes ready.');
    } catch (e) {
        logger.error('Failed to create tables: %s', e.message);
    }

    initializer.registerRpc('get_leaderboard', getLeaderboard);
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