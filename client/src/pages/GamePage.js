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

    const myMark = marks[myUserId];
    const isMyTurn = currentTurn === myUserId;
    const isXTurn = currentTurn ? marks[currentTurn] === 'X' : true;
    const result = checkWinner(cells);
    const isDraw = !result && cells.every(c => c !== null);

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
                    setStatus('playing');
                    setMyVoted(false);
                    setOpponentVoted(false);
                    break;

                case SERVER_OPCODE.GAME_STATE:
                    setCells(normalizeBoard(payload.board));
                    setCurrentTurn(payload.currentTurn);
                    break;

                case SERVER_OPCODE.GAME_OVER:
                    setCells(normalizeBoard(payload.board));
                    setStatus('finished');
                    if (payload.winner) {
                        setScores(s => ({
                            ...s,
                            [payload.winner]: s[payload.winner] + 1,
                        }));
                    }
                    break;

                case SERVER_OPCODE.REMATCH_VOTED:
                    if (payload.userId !== myUserId) {
                        setOpponentVoted(true);
                    }
                    break;

                case SERVER_OPCODE.REMATCH_START:
                    setCells(Array(9).fill(null));
                    setCurrentTurn(payload.currentTurn);
                    setStatus('playing');
                    setMyVoted(false);
                    setOpponentVoted(false);
                    break;

                case SERVER_OPCODE.MATCH_ENDED:
                    onLeaveRef.current();
                    break;

                default:
                    break;
            }
        };

        return () => {
            activeRef.current = false;
        };
    }, [socket, myUserId]);

    const handleCellClick = useCallback((index) => {
        if (!isMyTurn || status !== 'playing' || cells[index]) return;
        socket.sendMatchState(
            match.match_id,
            CLIENT_OPCODE.MOVE,
            JSON.stringify({ position: index })
        );
    }, [isMyTurn, status, cells, socket, match]);

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

    const iWon = result && marks[myUserId] === result.winner;

    const turnText = result
        ? iWon
            ? 'You won!'
            : `${players[result.winner]} won!`
        : isDraw
        ? "It's a draw!"
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
            myVoted={myVoted}
            opponentVoted={opponentVoted}
            onCellClick={handleCellClick}
            onRematch={handleRematch}
            onLeave={handleLeave}
        />
    );
}