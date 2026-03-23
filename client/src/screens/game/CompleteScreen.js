import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import { Confetti } from '../../components/confetti';
import { Layout } from '../../components/layout';
import { Score } from '../../components/score';
import { RoundButton } from '../../components/button';
import { CapitalText, NormalText } from '../../components/text';

export default function CompleteScreen({
    turnText, myStats, myVoted, opponentVoted, onRematch, onLeave, title, isWinner
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
                <CapitalText>{turnText}</CapitalText>
                <div className="flex items-center justify-center gap-4">
                    <RoundButton
                        onClick={onRematch} icon={RefreshIcon} disabled={myVoted}
                        glowing={opponentVoted} className={myVoted ? 'icon-spin' : ''}/>
                    <RoundButton onClick={onLeave} icon={LogoutIcon}/>
                </div>
            </div>
        </Layout>
    );
}