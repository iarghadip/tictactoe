import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { RoundButton } from '../../components/button';
import { NormalText } from '../../components/text';
import './Layout.css';

export default function Layout({ title, onBack, children }) {
    return (
        <div className="layout">
            <div className="layout__container">
                <div className="layout__header">
                    <RoundButton onClick={onBack}>
                        <ArrowBackIcon style={{ fontSize: 20 }} />
                    </RoundButton>
                    <NormalText size="2">{title}</NormalText>
                </div>
                {children}
            </div>
        </div>
    );
}