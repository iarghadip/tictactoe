import { useState, useEffect } from 'react';
import { useNakama } from './contexts/nakamaContext';
import HomePage from './pages/HomePage';
import MatchingPage from './pages/MatchingPage';
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AboutPage from './pages/AboutPage';
import './App.css';

function App() {
    const { restoring, session } = useNakama();
    const [step, setStep] = useState('home');
    const [match, setMatch] = useState(null);
    const [mode, setMode] = useState(() => localStorage.getItem('nk_mode') || 'timed');

    useEffect(() => {
        if (!restoring && session && localStorage.getItem('nk_in_match') === 'true') {
            localStorage.removeItem('nk_in_match');
            setStep('finding');
        }
    }, [restoring]);

    if (restoring) return null;

    const handleFindMatch = (selectedMode) => {
        localStorage.setItem('nk_mode', selectedMode);
        setMode(selectedMode);
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
            <MatchingPage
                mode={mode}
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
            <LeaderboardPage
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

    return (
        <HomePage
            onFindMatch={handleFindMatch}
            onGlobalRanks={() => setStep('leaderboard')}
            onAbout={() => setStep('about')}
        />
    );
}

export default App;