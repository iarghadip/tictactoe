import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../audio';

export default function Confetti({ isWinner }) {
    const firedRef = useRef(false);

    useEffect(() => {
        if (!isWinner || firedRef.current) return;

        firedRef.current = true;

        playSound('confetti');
        [0.1, 0.9].forEach(x => {
            confetti({
                particleCount: 120,
                spread: 100,
                origin: { x, y: 0.5 },
                gravity: 2.5,
            });
        });

        setTimeout(() => {
            playSound('confetti');
            confetti({
                particleCount: 120,
                spread: 75,
                origin: { y: 0.4 },
                gravity: 2.5,
            });
        }, 300);
    }, [isWinner]);

    return null;
}