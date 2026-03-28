import { useEffect, useState, useCallback, useRef } from 'react';
import { useNakama } from '../../contexts/nakamaContext';
import { SERVER_OPCODE, CLIENT_OPCODE } from '../../constants/opcodes';
import { GAME_WINNER_COMBINATIONS } from '../../constants/misc';
import { playSound, playMusic, stopMusic, waitForAudio } from '../../components/audio';
import ResultPage from '../Result/Page';
import Screen from './Screen';

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
    const marksRef = useRef({});
    const pendingSoundRef = useRef(null);

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
    const [showResult, setShowResult] = useState(false);
    const [audioLoaded, setAudioLoaded] = useState(false);
    const [gameReady, setGameReady] = useState(false);
    const [ackSentAt, setAckSentAt] = useState(null);

    useEffect(() => {
        waitForAudio().then(() => setAudioLoaded(true));
    }, []);

    const myMark = marks[myUserId];
    const opponentMark = myMark === 'X' ? 'O' : 'X';
    const opponentName = players[opponentMark];
    const isMyTurn = currentTurn === myUserId;
    const isFinished = status === 'finished';
    const isLoading = !players[myMark] || !players[opponentMark] || !audioLoaded || !gameReady;

    const result = checkWinner(cells);
    const winnerMark = result?.winner ?? gameOverWinner;
    const iWon = winnerMark && marks[myUserId] === winnerMark;

    const title = isLoading
        ? 'Loading the game'
        : `${players[myMark]} vs ${players[opponentMark]}`;

    const winText = winnerMark
        ? iWon ? 'You won! (+75)' : `${players[winnerMark]} won! (-25)`
        : 'It\'s a draw!'

    const turnText = isMyTurn
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
        setShowResult(false);
        setGameReady(true);
        setAckSentAt(null);
        pendingSoundRef.current = null;
        clearDisconnectTimer();
    }, [clearDisconnectTimer]);

    const fetchMyStats = useCallback(async () => {
        if (!client || !session || !myUserId) return;
        try {
            const res = await client.listLeaderboardRecords(
                session, 'tictactoe', [myUserId], 1000
            );
            const myRecord = res.owner_records?.[0];
            if (!myRecord) { setMyStats(null); return; }

            let rank = 0;
            if (res.records?.length > 0) {
                const idx = res.records.findIndex(r => r.owner_id === myUserId);
                if (idx >= 0) rank = idx + 1;
            }
            if (!rank) rank = parseInt(myRecord.rank, 10) || 0;

            const matches = myRecord.metadata?.matches || 0;
            const wins = myRecord.metadata?.wins || 0;
            const losses = myRecord.metadata?.losses || 0;
            const draws = matches - (wins + losses);

            setMyStats({
                id: myRecord.owner_id,
                display_name: myRecord.username || 'Anonymous',
                score: parseInt(myRecord.score, 10),
                rank,
                matches,
                wins,
                losses,
                draws
            });
        } catch (e) {
            console.error('Failed to fetch stats:', e);
        }
    }, [client, session, myUserId]);

    useEffect(() => {
        if (isFinished) {
            const timer = setTimeout(() => {
                stopMusic();
                const sound = pendingSoundRef.current;
                if (sound === 'win') playSound('bonus');
                else if (sound === 'loss') playSound('impact');
                else playSound('bonus');
                pendingSoundRef.current = null;
                setShowResult(true);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setShowResult(false);
        }
    }, [isFinished]);

    useEffect(() => { fetchMyStats(); }, [fetchMyStats]);
    useEffect(() => { if (isFinished) fetchMyStats(); }, [isFinished, fetchMyStats]);

    useEffect(() => {
        if (!ackSentAt || gameReady) return;
        const timer = setTimeout(() => {
            if (!activeRef.current) return;
            stopMusic();
            onLeaveRef.current();
        }, 60000);
        return () => clearTimeout(timer);
    }, [ackSentAt, gameReady]);

    useEffect(() => {
        if (!socket) return;
        activeRef.current = true;

        socket.onmatchdata = (data) => {
            if (!activeRef.current) return;
            const opcode = data.op_code;
            const payload = JSON.parse(new TextDecoder().decode(data.data));

            switch (opcode) {
                case SERVER_OPCODE.GAME_START:
                    marksRef.current = payload.marks;
                    setMarks(payload.marks);
                    setPlayers(payload.players);
                    setIsTimed((payload.mode ?? 'timed') === 'timed');
                    setGameReady(false);
                    setAckSentAt(Date.now());
                    socket.sendMatchState(
                        match.match_id,
                        CLIENT_OPCODE.READY_ACK,
                        JSON.stringify({})
                    );
                    break;

                case SERVER_OPCODE.GAME_BEGIN:
                    playMusic();
                    resetRound(payload, normalizeBoard(payload.board));
                    break;

                case SERVER_OPCODE.GAME_STATE:
                    playSound('pop');
                    setCells(normalizeBoard(payload.board));
                    setCurrentTurn(payload.currentTurn);
                    setTimeLeft(payload.timeLeft ?? 30);
                    break;

                case SERVER_OPCODE.GAME_OVER: {
                    const myMark_ = marksRef.current[myUserId];
                    const winner = payload.winner ?? null;
                    if (!winner) pendingSoundRef.current = 'draw';
                    else if (winner === myMark_) pendingSoundRef.current = 'win';
                    else pendingSoundRef.current = 'loss';
                    setCells(normalizeBoard(payload.board));
                    setStatus('finished');
                    setGameOverWinner(winner);
                    break;
                }

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

                case SERVER_OPCODE.MATCH_ENDED:
                    clearDisconnectTimer();
                    stopMusic();
                    onLeaveRef.current();
                    break;

                default:
                    break;
            }
        };

        return () => {
            activeRef.current = false;
            clearDisconnectTimer();
            stopMusic();
        };
    }, [socket, myUserId, match, clearDisconnectTimer, resetRound]);

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
        if (opponentDisconnected) {
            stopMusic();
            onLeaveRef.current();
        }
    }, [socket, match, opponentDisconnected]);

    if (showResult) {
        return (
            <ResultPage
                winText={winText}
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
        <Screen
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