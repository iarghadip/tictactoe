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

    logger.info('Tic-Tac-Toe module loaded.');
};