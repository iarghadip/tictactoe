import './MatchingScreen.css';

export default function MatchingScreen({ elapsed, displayName, onCancel }) {
    return (
        <div className="matching-screen">
            <div className="matching__container">
                <div className="matching__hourglass">⏳</div>
                <div className="matching__text">{displayName}</div>
                <div className="matching__text">
                    Finding a random player
                    <span className="matching__dots">
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                    </span>
                </div>
                <div className="matching__timer">{elapsed}s</div>
                <button className="matching__cancel" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
}