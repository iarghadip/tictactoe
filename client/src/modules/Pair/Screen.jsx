import HourglassEmptyIcon from '@mui/icons-material/HourglassEmptyTwoTone';
import LogoutIcon from '@mui/icons-material/LogoutTwoTone';
import { Button } from '../../components/button';
import { Layout } from '../../components/layout';
import { CapitalText, NormalText } from '../../components/text';
import './Screen.css';

export default function Screen({
    elapsed, displayName, onCancel, cancelBtnRef
}) {
    return (
        <Layout center className="gap-12">
            <div className="flex flex-col items-center w-full mx-auto matching__container">
                <div className="flex items-center justify-center card-theme card-theme-item">
                    <div className="flex items-center justify-center matching__hourglass">
                        <HourglassEmptyIcon style={{ fontSize: 32 }} />
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center flex-col gap-4">
                <NormalText size="1">{displayName}</NormalText>
                <CapitalText fill="-1">Finding a random player</CapitalText>
            </div>
            <div className="flex items-center justify-center flex-col gap-4">
                <CapitalText fill="-1">{elapsed}s</CapitalText>
                <Button onClick={onCancel} icon={LogoutIcon} btnRef={cancelBtnRef} danger />
            </div>
        </Layout>
    );
}