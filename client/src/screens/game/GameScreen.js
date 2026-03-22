import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import { Board } from '../../components/board';
import { Score } from '../../components/score';
import { RoundButton } from '../../components/button';
import { CapitalText } from '../../components/text';
import './GameScreen.css';

const TURN_LIMIT = 30;
const DISCONNECT_GRACE = 60;

export default function GameScreen({
    p1,
    p2,
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
        <div className="game-screen">
            <div className="game-container">
                <Score p1={p1} p2={p2} />
                <div className="game-board-wrapper">
                    <Board
                        squares={cells}
                        onCellClick={onCellClick}
                        disabled={!isPlaying || opponentDisconnected}
                        winCombo={winCombo}
                        isMyTurn={isMyTurn && !opponentDisconnected}
                    />
                </div>
                <div className="game-status">
                    {opponentDisconnected
                        ? <CapitalText fill={disconnectFill}>{opponentName} disconnected</CapitalText>
                        : <CapitalText fill={turnFill}>{turnText}</CapitalText>
                    }
                </div>
                <div className="game-actions">
                    {isFinished && (
                        <RoundButton glowing={opponentVoted} onClick={onRematch} disabled={myVoted}>
                            <RefreshIcon style={{ fontSize: 20 }} className={myVoted ? 'game-rematch-spinning' : ''} />
                        </RoundButton>
                    )}
                    <RoundButton onClick={onLeave} disabled={leaveDisabled}>
                        <LogoutIcon style={{ fontSize: 20 }} />
                    </RoundButton>
                </div>
            </div>
        </div>
    );
}