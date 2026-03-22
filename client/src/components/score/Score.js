import Circle from '../shapes/Circle';
import Cross from '../shapes/Cross';
import { NormalText } from '../text';
import './Score.css';

function Badge({ name, score, shape, isActive }) {
    return (
        <div className={`badge ${isActive ? 'active' : ''}`}>
            <div className="badge__shape">
                {shape === 'O' ? <Circle /> : <Cross />}
            </div>
            <NormalText size="4">{name}</NormalText>
            <NormalText size="1">{score}</NormalText>
        </div>
    );
}

export default function Score({ p1, p2 }) {
    return (
        <div className="score">
            <Badge
                name={p1.name}
                score={p1.score}
                shape={p1.mark}
                isActive={p1.turn}
            />
            <div className="score__divider" />
            <Badge
                name={p2.name}
                score={p2.score}
                shape={p2.mark}
                isActive={p2.turn}
            />
        </div>
    );
}