import './MatchingScreen.css';

export default function MatchingScreen({ elapsed, displayName, onCancel }) {
    return (
        <div className="finding">
            <div className="finding__container">
                <div className="finding__hourglass">⏳</div>
                <div className="finding__text">{displayName}</div>
                <div className="finding__text">
                    Finding a random player
                    <span className="finding__dots">
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                    </span>
                </div>
                <div className="finding__timer">{elapsed}s</div>
                <button className="finding__cancel" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
}