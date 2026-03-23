import { useEffect, useRef } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import confetti from 'canvas-confetti';
import { Layout } from '../../components/layout';
import { Score } from '../../components/score';
import { RoundButton } from '../../components/button';
import { CapitalText, NormalText } from '../../components/text';

export default function CompleteScreen({
    turnText, myStats, myVoted, opponentVoted, onRematch, onLeave, title, isWinner
}) {
    const firedRef = useRef(false);

    useEffect(() => {
        if (!isWinner || firedRef.current) return;
        firedRef.current = true;

        confetti({
            particleCount: 60,
            spread: 100,
            origin: { x: 0.1, y: 0.5 },
        });
        confetti({
            particleCount: 60,
            spread: 100,
            origin: { x: 0.9, y: 0.5 },
        });

        setTimeout(() => {
            confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.4 },
            });
        }, 300);
    }, [isWinner]);

    return (
        <Layout center className="gap-12">
            <div className="flex items-center justify-center flex-col gap-4">
                <NormalText size="1">Tic Tac Toe</NormalText>
                <CapitalText>{title}</CapitalText>
            </div>
            <Score stats={myStats} />
            <div className="flex items-center justify-center flex-col gap-4">
                <CapitalText>{turnText}</CapitalText>
                <div className="flex items-center justify-center gap-4">
                    <RoundButton glowing={opponentVoted} onClick={onRematch} disabled={myVoted}>
                        <RefreshIcon style={{ fontSize: 20 }} className={myVoted ? 'icon-spin' : ''} />
                    </RoundButton>
                    <RoundButton onClick={onLeave}>
                        <LogoutIcon style={{ fontSize: 20 }} />
                    </RoundButton>
                </div>
            </div>
        </Layout>
    );
}