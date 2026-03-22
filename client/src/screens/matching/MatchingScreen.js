import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { RoundButton } from '../../components/button';
import { CapitalText, NormalText } from '../../components/text';
import './MatchingScreen.css';

export default function MatchingScreen({ elapsed, displayName, onCancel }) {
    const canCancel = elapsed >= 30;

    return (
        <div className="matching-screen">
            <div className="matching__container">
                <div className="matching__hourglass-card">
                    <div className="matching__hourglass">
                        <HourglassEmptyOutlinedIcon style={{ fontSize: 32 }} />
                    </div>
                </div>
                <NormalText size="1">{displayName}</NormalText>
                <CapitalText fill="-1">Finding a random player</CapitalText>
                <CapitalText fill="-1">{elapsed}s</CapitalText>
                <RoundButton onClick={onCancel} disabled={!canCancel}>
                    <LogoutIcon style={{ fontSize: 20 }} />
                </RoundButton>
            </div>
        </div>
    );
}