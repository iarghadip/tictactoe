import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import { Layout } from '../../components/layout';
import { Score } from '../../components/score';
import { RoundButton } from '../../components/button';
import { CapitalText, NormalText } from '../../components/text';
import './CompleteScreen.css';

export default function CompleteScreen({
    turnText, myStats, myVoted, opponentVoted, onRematch, onLeave, title
}) {
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