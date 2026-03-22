import './MenuIcon.css';

export default function MenuIcon({ icon, color, size = 'md' }) {
    return (
        <span className={`menu-icon menu-icon--${size} menu-icon--${color}`}>
            {icon}
        </span>
    );
}