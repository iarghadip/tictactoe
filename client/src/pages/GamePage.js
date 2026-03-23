import { useEffect, useState, useCallback, useRef } from 'react';
import { useNakama } from '../contexts/nakamaContext';
import { GameScreen, CompleteScreen } from '../screens/game';
import { SERVER_OPCODE, CLIENT_OPCODE } from '../constants/opcodes';
import { GAME_WINNER_COMBINATIONS } from '../constants/miscellaneous';

function checkWinner(squares) {
    for (const combo of GAME_WINNER_COMBINATIONS) {
        const [a, b, c] = combo;
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { winner: squares[a], combo };
        }
    }
    return null;
}

function normalizeBoard(board) {
    return board.map(c => c === '' ? null : c);
}

export default function GamePage({ match, onLeave }) {
    const { socket, client, session, account } = useNakama();
    const myUserId = account?.user?.id;
    const activeRef = useRef(true);
    const onLeaveRef = useRef(onLeave);
    const disconnectTimerRef = useRef(null);

    useEffect(() => { onLeaveRef.current = onLeave; }, [onLeave]);

    const [cells, setCells] = useState(Array(9).fill(null));
    const [marks, setMarks] = useState({});
    const [currentTurn, setCurrentTurn] = useState(null);
    const [players, setPlayers] = useState({});
    const [status, setStatus] = useState('waiting');
    const [myVoted, setMyVoted] = useState(false);
    const [opponentVoted, setOpponentVoted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameOverWinner, setGameOverWinner] = useState(null);
    const [opponentDisconnected, setOpponentDisconnected] = useState(false);
    const [disconnectCountdown, setDisconnectCountdown] = useState(60);
    const [isTimed, setIsTimed] = useState(true);
    const [myStats, setMyStats] = useState(null);
    const [showComplete, setShowComplete] = useState(false);

    const myMark = marks[myUserId];
    const opponentMark = myMark === 'X' ? 'O' : 'X';
    const opponentName = players[opponentMark];
    const isMyTurn = currentTurn === myUserId;
    const isFinished = status === 'finished';
    const isLoading = !players[myMark] || !players[opponentMark];

    const result = checkWinner(cells);
    const winnerMark = result?.winner ?? gameOverWinner;
    const iWon = winnerMark && marks[myUserId] === winnerMark;

    const title = isLoading
        ? 'Loading the game'
        : `${players[myMark]} vs ${players[opponentMark]}`;

    const turnText = isFinished
        ? winnerMark
            ? iWon ? 'You won!' : `${players[winnerMark]} won!`
            : "It's a draw!"
        : isMyTurn
            ? 'Your turn'
            : `${opponentName}'s turn`;

    const bottomText = isLoading
        ? 'Loading the players'
        : opponentDisconnected
        ? `${opponentName} disconnected (${disconnectCountdown})`
        : isTimed
        ? `${turnText} (${timeLeft})`
        : turnText;

    const bottomFill = isLoading
        ? '-1'
        : opponentDisconnected
        ? ((60 - disconnectCountdown) / 60) * 100
        : isTimed
        ? ((30 - timeLeft) / 30) * 100
        : null;

    const leaveDisabled = opponentDisconnected && disconnectCountdown > 30;

    const clearDisconnectTimer = useCallback(() => {
        if (disconnectTimerRef.current) {
            clearInterval(disconnectTimerRef.current);
            disconnectTimerRef.current = null;
        }
    }, []);
    
    const resetRound = useCallback((payload, initialCells = Array(9).fill(null)) => {
        setCells(initialCells);
        setCurrentTurn(payload.currentTurn);
        setTimeLeft(payload.timeLeft ?? 30);
        setStatus('playing');
        setMyVoted(false);
        setOpponentVoted(false);
        setGameOverWinner(null);
        setOpponentDisconnected(false);
        clearDisconnectTimer();
    }, [clearDisconnectTimer]);

    const fetchMyStats = useCallback(async () => {
        if (!client || !session) return;
        try {
            const res = await client.rpc(session, 'get_leaderboard', {});
            setMyStats(res.payload?.myStats || null);
        } catch (e) {
            console.error('Failed to fetch stats:', e);
        }
    }, [client, session]);

    useEffect(() => {
        if (isFinished) {
            const timer = setTimeout(() => setShowComplete(true), 1500);
            return () => clearTimeout(timer);
        } else {
            setShowComplete(false);
        }
    }, [isFinished]);

    useEffect(() => { fetchMyStats(); }, [fetchMyStats]);
    useEffect(() => { if (isFinished) fetchMyStats(); }, [isFinished, fetchMyStats]);

    useEffect(() => {
        if (!socket) return;
        activeRef.current = true;

        socket.onmatchdata = (data) => {
            if (!activeRef.current) return;
            const opcode = data.op_code;
            const payload = JSON.parse(new TextDecoder().decode(data.data));

            switch (opcode) {
                case SERVER_OPCODE.GAME_START:
                    setMarks(payload.marks);
                    setPlayers(payload.players);
                    setIsTimed((payload.mode ?? 'timed') === 'timed');
                    resetRound(payload, normalizeBoard(payload.board));
                    break;

                case SERVER_OPCODE.GAME_STATE:
                    setCells(normalizeBoard(payload.board));
                    setCurrentTurn(payload.currentTurn);
                    setTimeLeft(payload.timeLeft ?? 30);
                    break;

                case SERVER_OPCODE.GAME_OVER:
                    setCells(normalizeBoard(payload.board));
                    setStatus('finished');
                    setGameOverWinner(payload.winner ?? null);
                    break;

                case SERVER_OPCODE.TIMER_UPDATE:
                    setTimeLeft(payload.timeLeft);
                    break;

                case SERVER_OPCODE.OPPONENT_DISCONNECTED:
                    setOpponentDisconnected(true);
                    setDisconnectCountdown(payload.gracePeriod ?? 60);
                    clearDisconnectTimer();
                    disconnectTimerRef.current = setInterval(() => {
                        setDisconnectCountdown(c => {
                            if (c <= 1) { clearDisconnectTimer(); return 0; }
                            return c - 1;
                        });
                    }, 1000);
                    break;

                case SERVER_OPCODE.OPPONENT_RECONNECTED:
                    setOpponentDisconnected(false);
                    setDisconnectCountdown(60);
                    clearDisconnectTimer();
                    break;

                case SERVER_OPCODE.REMATCH_VOTED:
                    if (payload.userId !== myUserId) setOpponentVoted(true);
                    break;

                case SERVER_OPCODE.REMATCH_START:
                    resetRound(payload);
                    break;

                case SERVER_OPCODE.MATCH_ENDED:
                    clearDisconnectTimer();
                    onLeaveRef.current();
                    break;

                default:
                    break;
            }
        };

        return () => {
            activeRef.current = false;
            clearDisconnectTimer();
        };
    }, [socket, myUserId, clearDisconnectTimer, resetRound]);

    const handleCellClick = useCallback((index) => {
        if (!isMyTurn || status !== 'playing' || cells[index] || opponentDisconnected) return;
        socket.sendMatchState(match.match_id, CLIENT_OPCODE.MOVE, JSON.stringify({ position: index }));
    }, [isMyTurn, status, cells, socket, match, opponentDisconnected]);

    const handleRematch = useCallback(() => {
        if (myVoted) return;
        setMyVoted(true);
        socket.sendMatchState(match.match_id, CLIENT_OPCODE.REMATCH_VOTE, JSON.stringify({}));
    }, [myVoted, socket, match]);

    const handleLeave = useCallback(() => {
        socket.sendMatchState(match.match_id, CLIENT_OPCODE.LEAVE, JSON.stringify({}));
        if (opponentDisconnected) onLeaveRef.current();
    }, [socket, match, opponentDisconnected]);

    if (showComplete) {
        return (
            <CompleteScreen
                turnText={turnText}
                myStats={myStats}
                myVoted={myVoted}
                opponentVoted={opponentVoted}
                onRematch={handleRematch}
                onLeave={handleLeave}
                title={title}
                isWinner={iWon}
            />
        );
    }

    return (
        <GameScreen
            cells={cells}
            winCombo={result?.combo ?? null}
            isMyTurn={isMyTurn}
            isLoading={isLoading}
            title={title}
            bottomText={bottomText}
            bottomFill={bottomFill}
            opponentDisconnected={opponentDisconnected}
            onCellClick={handleCellClick}
            onLeave={handleLeave}
            leaveDisabled={leaveDisabled}
        />
    );
}