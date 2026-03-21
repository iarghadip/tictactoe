import { useState, useEffect } from 'react';
import { useNakama } from './contexts/nakamaContext';
import EntryPage from './pages/EntryPage';
import MatchingPage from './pages/MatchingPage';

function App() {
    const { session, restoring } = useNakama();
    const [step, setStep] = useState('entry');

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
                onFound={() => setStep('game')}
                onCancel={() => setStep('entry')}
            />
        );
    }

    return null;
}

export default App;