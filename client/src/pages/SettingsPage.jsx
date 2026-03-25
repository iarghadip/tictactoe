import { useEffect, useState, useRef } from 'react';
import { useNakama } from '../contexts/nakamaContext';
import { SettingsScreen } from '../screens/settings';
import { getMusicEnabled, getSoundEnabled } from '../components/audio';
import { setMusicEnabled, setSoundEnabled } from '../components/audio';

export default function SettingsPage({ onBack }) {
    const { account, updateDisplayName } = useNakama();

    const rawName = account?.user?.display_name || '';
    const [nameValue, setNameValue] = useState(rawName);
    const [soundEnabled, setSoundEnabled_] = useState(getSoundEnabled);
    const [musicEnabled, setMusicEnabled_] = useState(getMusicEnabled);
    const debounceRef = useRef(null);
    const lastSavedRef = useRef(rawName);

    useEffect(() => {
        const incoming = account?.user?.display_name || '';
        if (incoming !== lastSavedRef.current) {
            setNameValue(incoming);
            lastSavedRef.current = incoming;
        }
    }, [account]);

    const handleNameChange = (value) => {
        setNameValue(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            if (value === lastSavedRef.current) return;
            try {
                await updateDisplayName(value.trim());
                lastSavedRef.current = value;
            } catch (e) {
                console.error('Failed to update name:', e);
            }
        }, 500);
    };

    const handleToggleSound = () => {
        const next = !soundEnabled;
        setSoundEnabled_(next);
        setSoundEnabled(next);
    };

    const handleToggleMusic = () => {
        const next = !musicEnabled;
        setMusicEnabled_(next);
        setMusicEnabled(next);
    };

    return (
        <SettingsScreen
            nameValue={nameValue}
            soundEnabled={soundEnabled}
            musicEnabled={musicEnabled}
            onNameChange={handleNameChange}
            onToggleSound={handleToggleSound}
            onToggleMusic={handleToggleMusic}
            onBack={onBack}
        />
    );
}