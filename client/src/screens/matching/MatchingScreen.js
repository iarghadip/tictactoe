import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { RoundButton } from '../../components/button';
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
                <div className="matching__text">{displayName}</div>
                <div className="matching__text matching__text--sub">
                    Finding a random player
                </div>
                <div className="matching__timer">{elapsed}s</div>
                <RoundButton onClick={onCancel} disabled={!canCancel}>
                    <LogoutIcon style={{ fontSize: 20 }} />
                </RoundButton>
            </div>
        </div>
    );
}