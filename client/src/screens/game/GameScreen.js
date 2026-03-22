import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import { Board } from '../../components/board';
import { Score } from '../../components/score';
import './GameScreen.css';

export default function GameScreen({
    p1,
    p2,
    cells,
    winCombo,
    turnText,
    status,
    isMyTurn,
    myVoted,
    opponentVoted,
    onCellClick,
    onRematch,
    onLeave,
}) {
    return (
        <div className="game-screen">
            <div className="game-container">
                <Score p1={p1} p2={p2} />
                <div className="game-board-wrapper">
                    <Board
                        squares={cells}
                        onCellClick={onCellClick}
                        disabled={status !== 'playing'}
                        winCombo={winCombo}
                        isMyTurn={isMyTurn}
                    />
                </div>
                <div className="game-turn">{turnText}</div>
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