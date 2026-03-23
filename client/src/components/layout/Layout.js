import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { RoundButton } from '../../components/button';
import { NormalText } from '../../components/text';
import './Layout.css';

export default function Layout({ title, onBack, children, center = false }) {
    return (
        <div className="flex layout">
            <div className={`${center ? 'flex-center' : 'flex'} layout__container`}>
                <div className="flex layout__header">
                    {onBack && (
                        <RoundButton onClick={onBack}>
                            <ArrowBackIcon style={{ fontSize: 20 }} />
                        </RoundButton>
                    )}
                    {title && <NormalText size="2">{title}</NormalText> }
                </div>
                {children}
            </div>
        </div>
    );
}