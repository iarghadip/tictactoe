import { useState } from 'react';
import { useNakama } from './contexts/nakamaContext';
import EntryPage from './pages/EntryPage';

function App() {

    const { session } = useNakama();
    const [step, setStep] = useState('entry');

    if (!session || step === 'entry') {
        return <EntryPage onDone={() => setStep('finding')} />;
    }
}

export default App;