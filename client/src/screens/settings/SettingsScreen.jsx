import PersonIcon from '@mui/icons-material/PersonTwoTone';
import VolumeUpIcon from '@mui/icons-material/VolumeUpTwoTone';
import VolumeOffIcon from '@mui/icons-material/VolumeOffTwoTone';
import MusicNoteIcon from '@mui/icons-material/MusicNoteTwoTone';
import MusicOffIcon from '@mui/icons-material/MusicOffTwoTone';
import { Layout } from '../../components/layout';
import { RoundButton } from '../../components/button';
import { NormalText, CapitalText } from '../../components/text';
import { MenuIcon } from '../../components/icon';
import './SettingsScreen.css';

export default function SettingsScreen({
    nameValue, soundEnabled, musicEnabled,
    onNameChange, onToggleSound, onToggleMusic, onBack,
}) {
    return (
        <Layout title="Player Settings" onBack={onBack}>
            <div className="flex flex-col overflow-hidden card-theme">
                <div className="flex items-center card-theme-item">
                    <MenuIcon icon={PersonIcon} />
                    <input
                        className="text-[15px] font-medium flex-1 bg-transparent outline-none"
                        value={nameValue}
                        onChange={e => onNameChange(e.target.value)}
                        placeholder="Display Name"
                        maxLength={10}
                        spellCheck={false}
                        autoComplete="off"
                    />
                </div>
            </div>
            <div className="flex flex-col overflow-hidden card-theme divide-y divide-white/[.04]">
                <div className="flex items-center card-theme-item">
                    <MenuIcon icon={MusicNoteIcon} />
                    <NormalText className="flex-1">Game Music</NormalText>
                    <RoundButton
                        icon={musicEnabled ? MusicNoteIcon : MusicOffIcon}
                        onClick={onToggleMusic}
                    />
                </div>
                <div className="flex items-center card-theme-item">
                    <MenuIcon icon={VolumeUpIcon} />
                    <NormalText className="flex-1">Sound Effects</NormalText>
                    <RoundButton
                        icon={soundEnabled ? VolumeUpIcon : VolumeOffIcon}
                        onClick={onToggleSound}
                    />
                </div>
            </div>
        </Layout>
    );
}