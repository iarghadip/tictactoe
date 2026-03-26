import RefreshIcon from '@mui/icons-material/RefreshTwoTone';
import LogoutIcon from '@mui/icons-material/LogoutTwoTone';
import { Confetti } from '../../components/confetti';
import { Layout } from '../../components/layout';
import { Score } from '../../components/score';
import { Button } from '../../components/button';
import { CapitalText, NormalText } from '../../components/text';
import './Screen.css';

export default function Screen({
    winText, myStats, myVoted, opponentVoted,
    onRematch, onLeave, title, isWinner
}) {
    return (
        <Layout center className="gap-12">
            <div className="flex items-center justify-center flex-col gap-4">
                <NormalText size="1">Tic Tac Toe</NormalText>
                <CapitalText>{title}</CapitalText>
            </div>
            <Confetti isWinner={isWinner} />
            <Score stats={myStats} />
            <div className="flex items-center justify-center flex-col gap-4">
                <CapitalText>{winText}</CapitalText>
                <div className="flex items-center justify-center gap-4">
                    <Button
                        onClick={onRematch} icon={RefreshIcon} disabled={myVoted}
                        glowing={opponentVoted} className={myVoted ? 'icon-spin' : ''}/>
                    <Button onClick={onLeave} icon={LogoutIcon} danger />
                </div>
            </div>
        </Layout>
    );
}