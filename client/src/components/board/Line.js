import './Line.css';

const CELL_SIZE = 100;
const PADDING = 16;

function getCenter(index) {
    return {
        x: (index % 3) * CELL_SIZE + CELL_SIZE / 2,
        y: Math.floor(index / 3) * CELL_SIZE + CELL_SIZE / 2,
    };
}

export default function Line({ combo }) {
    const start = getCenter(combo[0]);
    const end   = getCenter(combo[2]);

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy) + PADDING * 2;
    const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);

    const mx = (start.x + end.x) / 2;
    const my = (start.y + end.y) / 2;

    return (
        <div
            style={{
                position: 'absolute',
                left: `${mx}px`,
                top: `${my}px`,
                width: `${length}px`,
                height: '6px',
                transform: `translate(-50%, -50%) rotate(${angleDeg}deg)`,
                transformOrigin: 'center center',
                pointerEvents: 'none',
                zIndex: 10,
            }}
        >
            <div className="line" style={{ width: '100%' }} />
        </div>
    );
}