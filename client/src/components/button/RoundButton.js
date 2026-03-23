import './RoundButton.css';

export default function RoundButton({
    onClick, disabled, glowing, btnRef, icon: Icon, className = ''
}) {
    return (
        <button
            ref={btnRef}
            onClick={onClick}
            disabled={disabled}
            className={`
                flex items-center justify-center
                w-11 h-11 rounded-full
                border-none text-xl
                cursor-pointer shrink-0
                relative overflow-visible
                disabled:opacity-30 disabled:cursor-not-allowed
                round-btn
                ${glowing ? 'round-btn--glowing' : ''}
                ${className}
            `}
        >
            <Icon style={{ fontSize: 20 }} />
        </button>
    );
}