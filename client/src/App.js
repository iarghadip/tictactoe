import { useState, useEffect } from 'react';
import { useNakama } from './contexts/nakamaContext';
import HomePage from './pages/HomePage';
import MatchPage from './pages/MatchPage';
import GamePage from './pages/GamePage';
import RankPage from './pages/RankPage';
import AboutPage from './pages/AboutPage';
import RoomPage from './pages/RoomPage';

export default function App() {
    const { restoring, session } = useNakama();
    const [step, setStep] = useState('home');
    const [match, setMatch] = useState(null);
    const [mode, setMode] = useState(() => localStorage.getItem('nk_mode') || 'timed');
    const [matchRoomId, setMatchRoomId] = useState(null);

    useEffect(() => {
        if (!restoring && session && localStorage.getItem('nk_in_match') === 'true') {
            localStorage.removeItem('nk_in_match');
            setStep('finding');
        }
    }, [restoring, session]);

    if (restoring) return null;

    const handleFindMatch = (selectedMode, roomId = null) => {
        localStorage.setItem('nk_mode', selectedMode);
        setMode(selectedMode);
        setMatchRoomId(roomId);
        setStep('finding');
    };

    const handleFound = (foundMatch) => {
        localStorage.setItem('nk_in_match', 'true');
        setMatch(foundMatch);
        setStep('game');
    };

    const handleLeave = () => {
        localStorage.removeItem('nk_in_match');
        setMatch(null);
        setStep('finding');
    };

    if (step === 'finding') {
        return (
            <MatchPage
                mode={mode}
                roomId={matchRoomId}
                onFound={handleFound}
                onCancel={() => setStep('home')}
            />
        );
    }

    if (step === 'game' && match) {
        return (
            <GamePage
                match={match}
                onLeave={handleLeave}
            />
        );
    }

    if (step === 'leaderboard') {
        return (
            <RankPage
                onBack={() => setStep('home')}
            />
        );
    }

    if (step === 'about') {
        return (
            <AboutPage
                onBack={() => setStep('home')}
            />
        );
    }

    if (step === 'rooms') {
        return (
            <RoomPage
                onBack={() => setStep('home')}
                onRoomMatch={(roomId) => handleFindMatch('timed', roomId)}
            />
        );
    }

    return (
        <HomePage
            onFindMatch={handleFindMatch}
            onGlobalRanks={() => setStep('leaderboard')}
            onAbout={() => setStep('about')}
            onRooms={() => setStep('rooms')}
        />
    );
}