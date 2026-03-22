import './RoundButton.css';

export default function RoundButton({ onClick, disabled, glowing, children }) {
    return (
        <button
            className={`round-btn${glowing ? ' round-btn--glowing' : ''}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}