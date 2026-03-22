import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import { Board } from '../../components/board';
import { Score } from '../../components/score';
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
    myVoted,
    opponentVoted,
    opponentDisconnected,
    disconnectCountdown,
    onCellClick,
    onRematch,
    onLeave,
}) {
    const fillPct = status === 'playing' && !opponentDisconnected
        ? ((TURN_LIMIT - timeLeft) / TURN_LIMIT) * 100
        : 0;

    const disconnectFillPct = opponentDisconnected
        ? ((DISCONNECT_GRACE - disconnectCountdown) / DISCONNECT_GRACE) * 100
        : 0;

    const turnStyle = status === 'playing' && !opponentDisconnected
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
                                Opponent disconnected
                            </span>
                        </div>
                    )
                    : (
                        <div
                            className={`game-turn ${status === 'playing' ? 'timed' : ''}`}
                            style={turnStyle}
                        >
                            {turnText}
                        </div>
                    )
                }
                {status === 'finished' && (
                    <div className="game-actions">
                        <button
                            className={`game-action-btn ${opponentVoted ? 'glowing' : ''}`}
                            onClick={onRematch}
                            disabled={myVoted}
                        >
                            <RefreshIcon style={{ fontSize: 20 }} className={myVoted ? 'game-rematch-spinning' : ''} />
                        </button>
                        <button className="game-action-btn" onClick={onLeave}>
                            <LogoutIcon style={{ fontSize: 20 }} />
                        </button>
                    </div>
                )}
                {status !== 'finished' && (
                    <div className="game-actions">
                        <button className="game-action-btn" onClick={onLeave}>
                            <LogoutIcon style={{ fontSize: 20 }} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}