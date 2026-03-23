import Circle from '../shapes/Circle';
import Cross from '../shapes/Cross';
import './Square.css';

export default function Square({ value, onClick, disabled, isMyTurn }) {
    return (
        <div
            onClick={disabled ? null : onClick}
            className={`
                flex items-center justify-center
                w-[100px] h-[100px]
                box-border relative overflow-visible
                cursor-default
                square
                ${disabled ? 'disabled cursor-not-allowed pointer-events-none' : ''}
                ${isMyTurn && !value ? 'hoverable cursor-pointer' : ''}
            `}
        >
            {value === 'O' && <Circle />}
            {value === 'X' && <Cross />}
        </div>
    );
}