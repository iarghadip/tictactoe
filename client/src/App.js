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
            setStep('match');
        }
    }, [restoring, session]);

    if (restoring) return null;

    const handleFindMatch = (selectedMode, roomId = null) => {
        localStorage.setItem('nk_mode', selectedMode);
        setMode(selectedMode);
        setMatchRoomId(roomId);
        setStep('match');
    };

    const handleFound = (foundMatch) => {
        localStorage.setItem('nk_in_match', 'true');
        setMatch(foundMatch);
        setStep('game');
    };

    const handleLeave = () => {
        localStorage.removeItem('nk_in_match');
        setMatch(null);
        setStep('match');
    };

    if (step === 'match') {
        return (
            <MatchPage
                mode={mode}
                roomId={matchRoomId}
                onFound={handleFound}
                onCancel={() => setStep(matchRoomId ? 'room' : 'home')}
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

    if (step === 'rank') {
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

    if (step === 'room') {
        return (
            <RoomPage
                onBack={() => setStep('home')}
                onRoomMatch={(mode, roomId) => handleFindMatch(mode, roomId)}
            />
        );
    }

    return (
        <HomePage
            onFindMatch={handleFindMatch}
            onGlobalRanks={() => setStep('rank')}
            onAbout={() => setStep('about')}
            onRooms={() => setStep('room')}
        />
    );
}