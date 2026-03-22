import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import { Board } from '../../components/board';
import { Score } from '../../components/score';
import { RoundButton } from '../../components/button';
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

    const fillPct = isTimed && status === 'playing' && !opponentDisconnected
        ? ((TURN_LIMIT - timeLeft) / TURN_LIMIT) * 100
        : 0;

    const disconnectFillPct = opponentDisconnected
        ? ((DISCONNECT_GRACE - disconnectCountdown) / DISCONNECT_GRACE) * 100
        : 0;

    const turnStyle = isTimed && status === 'playing' && !opponentDisconnected
        ? { '--fill': `${fillPct}%` }
        : {};

    const disconnectStyle = opponentDisconnected
        ? { '--fill': `${disconnectFillPct}%` }
        : {};

    return (
        <div className="game-screen">
            <div className="game-container">
                <Score p1={p1} p2={p2} />
                <div className="game-board-wrapper">
                    <Board
                        squares={cells}
                        onCellClick={onCellClick}
                        disabled={status !== 'playing' || opponentDisconnected}
                        winCombo={winCombo}
                        isMyTurn={isMyTurn && !opponentDisconnected}
                    />
                </div>
                {opponentDisconnected
                    ? (
                        <div className="game-disconnect">
                            <span
                                className="game-disconnect__text timed"
                                style={disconnectStyle}
                            >
                                {opponentName} disconnected
                            </span>
                        </div>
                    )
                    : (
                        <div
                            className={`game-turn ${isTimed && status === 'playing' ? 'timed' : ''}`}
                            style={turnStyle}
                        >
                            {turnText}
                        </div>
                    )
                }
                {status === 'finished' && (
                    <div className="game-actions">
                        <RoundButton
                            glowing={opponentVoted}
                            onClick={onRematch}
                            disabled={myVoted}
                        >
                            <RefreshIcon style={{ fontSize: 20 }} className={myVoted ? 'game-rematch-spinning' : ''} />
                        </RoundButton>
                        <RoundButton onClick={onLeave}>
                            <LogoutIcon style={{ fontSize: 20 }} />
                        </RoundButton>
                    </div>
                )}
                {status !== 'finished' && (
                    <div className="game-actions">
                        <RoundButton onClick={onLeave}>
                            <LogoutIcon style={{ fontSize: 20 }} />
                        </RoundButton>
                    </div>
                )}
            </div>
        </div>
    );
}