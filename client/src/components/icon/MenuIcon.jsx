import './MenuIcon.css';

export default function MenuIcon({
    icon: Icon, color = 'teal'
}) {
    return (
        <span
            className={`
                flex items-center justify-center shrink-0
                w-9 h-9 menu-icon menu-icon--${color}
            `}
        >
            <Icon fontSize="small" />
        </span>
    );
}