import Person from '@mui/icons-material/Person';
import VolumeUp from '@mui/icons-material/VolumeUp';
import VolumeOff from '@mui/icons-material/VolumeOff';
import MusicNote from '@mui/icons-material/MusicNote';
import MusicOff from '@mui/icons-material/MusicOff';
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
                    <MenuIcon icon={Person} />
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
                    <MenuIcon icon={MusicNote} />
                    <NormalText className="flex-1">Game Music</NormalText>
                    <RoundButton
                        icon={musicEnabled ? MusicNote : MusicOff}
                        onClick={onToggleMusic}
                    />
                </div>
                <div className="flex items-center card-theme-item">
                    <MenuIcon icon={VolumeUp} />
                    <NormalText className="flex-1">Sound Effects</NormalText>
                    <RoundButton
                        icon={soundEnabled ? VolumeUp : VolumeOff}
                        onClick={onToggleSound}
                    />
                </div>
            </div>
        </Layout>
    );
}