import './MenuText.css';

export default function MenuText({
    text, color = 'teal'
}) {
    return (
        <span
            className={`
                flex items-center justify-center shrink-0
                w-9 h-9 text-sm font-medium menu-text menu-text--${color}
            `}
        >
            {text}
        </span>
    );
}