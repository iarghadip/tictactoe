import { useState, useEffect } from 'react';
import { useNakama } from './contexts/nakamaContext';
import EntryPage from './pages/EntryPage';
import MatchingPage from './pages/MatchingPage';
import GamePage from './pages/GamePage';
import './App.css';

function App() {
    const { session, restoring } = useNakama();
    const [step, setStep] = useState('entry');
    const [match, setMatch] = useState(null);

    useEffect(() => {
        if (session && step === 'entry') {
            setStep('finding');
        }
    }, [session]);

    if (restoring) return null;

    if (!session) {
        return <EntryPage onDone={() => setStep('finding')} />;
    }

    if (step === 'finding') {
        return (
            <MatchingPage
                onFound={(foundMatch) => {
                    setMatch(foundMatch);
                    setStep('game');
                }}
                onCancel={() => setStep('entry')}
            />
        );
    }

    if (step === 'game' && match) {
        return (
            <GamePage
                match={match}
                onLeave={() => {
                    setMatch(null);
                    setStep('finding');
                }}
            />
        );
    }

    return null;
}

export default App;