import { useState } from 'react';
import { useNakama } from '../contexts/nakamaContext';
import { EntryScreen } from '../screens/entry';

export default function EntryPage({ onDone }) {
    
    const { connect } = useNakama();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleEntry = async (username, displayName) => {
        setLoading(true);
        console.log('Connecting:', username, displayName);
        try {
            await connect(username, displayName);
            console.log('Connected successfully:', username);
            onDone();
        } catch (e) {
            console.error('Connection failed:', e);
            setError(e.message || 'Choose a different username!');
        } finally {
            setLoading(false);
        }
    };

    return <EntryScreen onDone={handleEntry} loading={loading} error={error} />;
}