import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import { Layout } from '../../components/layout';
import { Board } from '../../components/board';
import { Score } from '../../components/score';
import { RoundButton } from '../../components/button';
import { CapitalText } from '../../components/text';
import './GameScreen.css';

const TURN_LIMIT = 30;
const DISCONNECT_GRACE = 60;

export default function GameScreen({
    cells,
    winCombo,
    turnText,
    status,
    isMyTurn,
    timeLeft,
    gameMode,
    myVoted,
    opponentVoted,
    opponentDisconnected,
    opponentName,
    disconnectCountdown,
    myStats,
    onCellClick,
    onRematch,
    onLeave,
}) {
    const isTimed = gameMode === 'timed';
    const isPlaying = status === 'playing';
    const isFinished = status === 'finished';
    const leaveDisabled = opponentDisconnected && disconnectCountdown > 30;

    const turnFill = isTimed && isPlaying && !opponentDisconnected
        ? ((TURN_LIMIT - timeLeft) / TURN_LIMIT) * 100
        : null;

    const disconnectFill = opponentDisconnected
        ? ((DISCONNECT_GRACE - disconnectCountdown) / DISCONNECT_GRACE) * 100
        : null;

    return (
        <Layout>
            <Score stats={myStats} />
            <div className="flex-center">
                <Board
                    squares={cells}
                    onCellClick={onCellClick}
                    disabled={!isPlaying || opponentDisconnected}
                    winCombo={winCombo}
                    isMyTurn={isMyTurn && !opponentDisconnected}
                />
            </div>
            <div className="flex-center">
                {opponentDisconnected
                    ? <CapitalText fill={disconnectFill}>{opponentName} disconnected</CapitalText>
                    : <CapitalText fill={turnFill}>{turnText}</CapitalText>
                }
            </div>
            <div className="flex-center gap">
                {isFinished && (
                    <RoundButton glowing={opponentVoted} onClick={onRematch} disabled={myVoted}>
                        <RefreshIcon style={{ fontSize: 20 }} className={myVoted ? 'icon-spin' : ''} />
                    </RoundButton>
                )}
                <RoundButton onClick={onLeave} disabled={leaveDisabled}>
                    <LogoutIcon style={{ fontSize: 20 }} />
                </RoundButton>
            </div>
        </Layout>
    );
}