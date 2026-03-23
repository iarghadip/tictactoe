import Square from './Square';
import Line from './Line';
import './Board.css';

const WIN_COMBOS = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6],
];

export function checkWinner(squares) {
    for (const combo of WIN_COMBOS) {
        const [a, b, c] = combo;
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { winner: squares[a], combo };
        }
    }
    return null;
}

export default function Board({ squares, onCellClick, disabled, winCombo, isMyTurn }) {
    return (
        <div className="grid overflow-visible rounded-2xl relative w-[300px] h-[300px] board">
            <div className="board-line horizontal h1 absolute w-full left-0 rounded-full z-0" />
            <div className="board-line horizontal h2 absolute w-full left-0 rounded-full z-0" />
            <div className="board-line vertical v1 absolute h-full top-0 rounded-full z-0" />
            <div className="board-line vertical v2 absolute h-full top-0 rounded-full z-0" />
            {squares.map((value, index) => (
                <Square
                    key={index}
                    value={value}
                    onClick={() => onCellClick(index)}
                    disabled={disabled || value !== null}
                    isMyTurn={isMyTurn}
                />
            ))}
            {winCombo && <Line combo={winCombo} />}
        </div>
    );
}