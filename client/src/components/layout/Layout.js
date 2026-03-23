import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { RoundButton } from '../../components/button';
import { NormalText } from '../../components/text';
import './Layout.css';

export default function Layout({ title, onBack, children, center = false, className = 'gap-6' }) {
    const hasHeader = onBack || title;
    return (
        <div className="flex min-h-screen w-full justify-center p-5 box-border">
            <div
                className={`
                    flex flex-col !items-stretch
                    w-full max-w-[480px] ${hasHeader ? 'pb-10' : ''}
                    ${center ? 'items-center justify-center' : ''}
                    ${className}
                `}
            >
                {hasHeader && (
                    <div className="relative flex items-center gap-4 py-2 sticky top-0 z-10 layout__header">
                        {onBack && <RoundButton onClick={onBack} icon={ArrowBackIcon}/>}
                        {title && <NormalText size="2">{title}</NormalText>}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}