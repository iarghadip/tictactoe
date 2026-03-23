import './Line.css';

const getCenter = (i) => ({ x: (i % 3) * 100 + 100 / 2, y: Math.floor(i / 3) * 100 + 100 / 2 });

export default function Line({ combo }) {
    const start = getCenter(combo[0]);
    const end = getCenter(combo[2]);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy) + 16 * 2;
    const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
    const mx = (start.x + end.x) / 2;
    const my = (start.y + end.y) / 2;

    return (
        <div
            style={{
                left: `${mx}px`,
                top: `${my}px`,
                width: `${length}px`,
                transform: `translate(-50%, -50%) rotate(${angleDeg}deg)`,
                transformOrigin: 'center center',
            }}
            className="absolute h-[6px] pointer-events-none z-10"
        >
            <div className="line w-full h-full rounded-full" />
        </div>
    );
}