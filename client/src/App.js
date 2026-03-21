import { useState } from 'react';
import { useNakama } from './contexts/nakamaContext';
import EntryPage from './pages/EntryPage';

function App() {
    const { session, restoring } = useNakama();
    const [step, setStep] = useState('entry');

    if (restoring) return null;

    if (!session) {
        return <EntryPage onDone={() => setStep('finding')} />;
    }
}

export default App;