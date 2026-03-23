import { NORMAL_TEXT_FONT_SIZE } from '../../constants/miscellaneous';
import './NormalText.css';

export default function NormalText({ children, size = '3', danger = false, className = '' }) {
    return (
        <span
            className={`
                normal-text
                ${NORMAL_TEXT_FONT_SIZE[size]}
                ${danger ? 'normal-text--danger' : ''}
                ${className}
            `}
        >
            {children}
        </span>
    );
}