import Circle from '../shapes/Circle';
import Cross from '../shapes/Cross';
import './Square.css';

export default function Square({ value, onClick, disabled, isMyTurn }) {
    return (
        <div
            className={`square ${disabled ? 'disabled' : ''} ${isMyTurn && !value ? 'hoverable' : ''}`}
            onClick={disabled ? null : onClick}
        >
            {value === 'O' && <Circle />}
            {value === 'X' && <Cross />}
        </div>
    );
}