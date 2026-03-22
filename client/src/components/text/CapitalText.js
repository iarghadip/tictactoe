import './CapitalText.css';

export default function CapitalText({ children, size = 13, fill = null }) {
    let className = 'capital-text';
    let style;

    if (fill == -1) {
        className += ' capital-text--util capital-text--sweep';
    } else if (fill !== null) {
        className += ' capital-text--util capital-text--load';
        style = { '--fill': `${fill}%` };
    }

    return (
        <span className={className} style={{ ...style, fontSize: `${size}px` }}>
        {children}
        </span>
    );
}