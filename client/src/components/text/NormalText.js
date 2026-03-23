import { NORMAL_TEXT_FONT_SIZE } from '../../constants/sizes';
import './NormalText.css';

export default function NormalText({ children, size = '3', danger = false, className = '' }) {
    return (
        <span
            className={`font-bold normal-text ${danger ? 'normal-text--danger' : ''} ${className}`}
            style={NORMAL_TEXT_FONT_SIZE[size]}
        >
            {children}
        </span>
    );
}