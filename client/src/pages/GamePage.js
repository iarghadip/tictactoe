import { useEffect, useState, useCallback, useRef } from 'react';
import { useNakama } from '../contexts/nakamaContext';
import { GameScreen } from '../screens/game';
import { SERVER_OPCODE, CLIENT_OPCODE } from '../constants/opcodes';
import { checkWinner } from '../components/board';

function normalizeBoard(board) {
    return board.map(c => c === '' ? null : c);
}

export default function GamePage({ match, onLeave }) {
    const { socket, account } = useNakama();
    const myUserId = account?.user?.id;
    const activeRef = useRef(true);
    const onLeaveRef = useRef(onLeave);
    const disconnectTimerRef = useRef(null);

    useEffect(() => {
        onLeaveRef.current = onLeave;
    }, [onLeave]);

    const [cells, setCells] = useState(Array(9).fill(null));
    const [marks, setMarks] = useState({});
    const [currentTurn, setCurrentTurn] = useState(null);
    const [scores, setScores] = useState({ X: 0, O: 0 });
    const [players, setPlayers] = useState({});
    const [status, setStatus] = useState('waiting');
    const [myVoted, setMyVoted] = useState(false);
    const [opponentVoted, setOpponentVoted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameOverWinner, setGameOverWinner] = useState(null);
    const [opponentDisconnected, setOpponentDisconnected] = useState(false);
    const [disconnectCountdown, setDisconnectCountdown] = useState(60);
    const [gameMode, setGameMode] = useState('timed');

    const myMark = marks[myUserId];
    const opponentMark = myMark === 'X' ? 'O' : 'X';
    const opponentName = players[opponentMark] ?? '...';
    const isMyTurn = currentTurn === myUserId;
    const isXTurn = currentTurn ? marks[currentTurn] === 'X' : true;
    const result = checkWinner(cells);
    const isDraw = !result && cells.every(c => c !== null);

    const clearDisconnectTimer = useCallback(() => {
        if (disconnectTimerRef.current) {
            clearInterval(disconnectTimerRef.current);
            disconnectTimerRef.current = null;
        }
    }, []);

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
                    setCells(normalizeBoard(payload.board));
                    setCurrentTurn(payload.currentTurn);
                    setTimeLeft(payload.timeLeft ?? 30);
                    setScores(payload.scores ?? { X: 0, O: 0 });
                    setGameMode(payload.mode ?? 'timed');
                    setStatus('playing');
                    setMyVoted(false);
                    setOpponentVoted(false);
                    setGameOverWinner(null);
                    setOpponentDisconnected(false);
                    clearDisconnectTimer();
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
                    if (payload.winner) {
                        setScores(s => ({
                            ...s,
                            [payload.winner]: s[payload.winner] + 1,
                        }));
                    }
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
                            if (c <= 1) {
                                clearDisconnectTimer();
                                return 0;
                            }
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
                    if (payload.userId !== myUserId) {
                        setOpponentVoted(true);
                    }
                    break;

                case SERVER_OPCODE.REMATCH_START:
                    setCells(Array(9).fill(null));
                    setCurrentTurn(payload.currentTurn);
                    setTimeLeft(payload.timeLeft ?? 30);
                    setStatus('playing');
                    setMyVoted(false);
                    setOpponentVoted(false);
                    setGameOverWinner(null);
                    setOpponentDisconnected(false);
                    clearDisconnectTimer();
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
    }, [socket, myUserId, clearDisconnectTimer]);

    const handleCellClick = useCallback((index) => {
        if (!isMyTurn || status !== 'playing' || cells[index] || opponentDisconnected) return;
        socket.sendMatchState(
            match.match_id,
            CLIENT_OPCODE.MOVE,
            JSON.stringify({ position: index })
        );
    }, [isMyTurn, status, cells, socket, match, opponentDisconnected]);

    const handleRematch = useCallback(() => {
        if (myVoted) return;
        setMyVoted(true);
        socket.sendMatchState(
            match.match_id,
            CLIENT_OPCODE.REMATCH_VOTE,
            JSON.stringify({})
        );
    }, [myVoted, socket, match]);

    const handleLeave = useCallback(() => {
        socket.sendMatchState(
            match.match_id,
            CLIENT_OPCODE.LEAVE,
            JSON.stringify({})
        );
    }, [socket, match]);

    const winnerMark = result ? result.winner : gameOverWinner;
    const iWon = winnerMark && marks[myUserId] === winnerMark;

    const turnText = status === 'finished'
        ? winnerMark
            ? iWon
                ? 'You won!'
                : `${players[winnerMark]} won!`
            : "It's a draw!"
        : isMyTurn
        ? 'Your turn'
        : `${players[myMark === 'X' ? 'O' : 'X']}'s turn`;

    return (
        <GameScreen
            p1={{ name: players['O'] ?? '...', score: scores.O, mark: 'O', turn: !isXTurn }}
            p2={{ name: players['X'] ?? '...', score: scores.X, mark: 'X', turn: isXTurn }}
            cells={cells}
            winCombo={result?.combo ?? null}
            turnText={turnText}
            status={status}
            isMyTurn={isMyTurn}
            timeLeft={timeLeft}
            gameMode={gameMode}
            myVoted={myVoted}
            opponentVoted={opponentVoted}
            opponentDisconnected={opponentDisconnected}
            opponentName={opponentName}
            disconnectCountdown={disconnectCountdown}
            onCellClick={handleCellClick}
            onRematch={handleRematch}
            onLeave={handleLeave}
        />
    );
}