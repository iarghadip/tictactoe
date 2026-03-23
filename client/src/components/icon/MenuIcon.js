import './MenuIcon.css';

export default function MenuIcon({
    icon: Icon, color = 'teal', size = 'md'
}) {
    return (
        <span
            className={`
                flex items-center justify-center shrink-0
                ${size === 'md' ? 'w-9 h-9' : 'w-8 h-8'}
                menu-icon menu-icon--${size} menu-icon--${color}
            `}
        >
            <Icon fontSize="small" />
        </span>
    );
}