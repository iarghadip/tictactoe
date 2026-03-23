import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { RoundButton } from '../../components/button';
import { NormalText } from '../../components/text';
import './Layout.css';

export default function Layout({ title, onBack, children, center = false, className = '' }) {
    return (
        <div className="flex min-h-screen w-full justify-center p-5 box-border">
            <div
                className={`
                    flex flex-col !items-stretch gap-6
                    w-full max-w-[480px] pb-10
                    ${center ? 'items-center justify-center' : ''}
                    ${className}
                `}
            >
                <div className="relative flex items-center gap-4 py-2 sticky top-0 z-10 layout__header">
                    {onBack && (
                        <RoundButton onClick={onBack}>
                            <ArrowBackIcon style={{ fontSize: 20 }} />
                        </RoundButton>
                    )}
                    {title && <NormalText size="2">{title}</NormalText>}
                </div>
                {children}
            </div>
        </div>
    );
}