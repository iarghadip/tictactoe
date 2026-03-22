import './CapitalText.css';

export default function CapitalText({ children, size = 13, fill = null }) {
    let className = 'text';
    let style;

    if (fill == -1) {
        className += ' util sweep';
    } else if (fill !== null) {
        className += ' util load';
        style = { '--fill': `${fill}%` };
    }

    return (
        <span className={className} style={{ ...style, fontSize: `${size}px` }}>
            {children}
        </span>
    );
}