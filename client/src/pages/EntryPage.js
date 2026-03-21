import { useState } from 'react';
import { useNakama } from '../contexts/nakamaContext';
import { EntryScreen } from '../screens/entry';

export default function EntryPage({ onDone }) {
    const { connect } = useNakama();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleEntry = async (username, displayName) => {
        setLoading(true);
        try {
            await connect(username, displayName);
            onDone();
        } catch (e) {
            setError(e.message || 'Choose a different username!');
        } finally {
            setLoading(false);
        }
    };

    return <EntryScreen onDone={handleEntry} loading={loading} error={error} />;
}