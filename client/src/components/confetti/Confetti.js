import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export default function Confetti({ isWinner }) {
    const firedRef = useRef(false);

    useEffect(() => {
        if (!isWinner || firedRef.current) return;
        firedRef.current = true;

        [0.1, 0.9].forEach(x => {
            confetti({
                particleCount: 60,
                spread: 100,
                origin: { x: x, y: 0.5 },
            });
        });

        setTimeout(() => {
            confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.4 },
            });
        }, 300);
    }, [isWinner]);

    return null;
}