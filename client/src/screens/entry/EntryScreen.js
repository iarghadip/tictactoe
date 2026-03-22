import { useState } from 'react';
import './EntryScreen.css';

export default function EntryScreen({ onDone, loading, error }) {
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');

    function handleSubmit() {
        onDone(username.trim(), displayName.trim() || username.trim());
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') handleSubmit();
    }

    return (
        <div className="entry-screen">
            <div className="entry__container">
                <div className="entry__title">Who are you?</div>
                {error && <p className="entry__error">{error}</p>}
                <div className="entry__row">
                    <input
                        className="entry__input"
                        type="text"
                        placeholder="Username"
                        maxLength={10}
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                </div>
                <div className="entry__row">
                    <input
                        className="entry__input"
                        type="text"
                        placeholder="Display name"
                        maxLength={10}
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <button
                    className="entry__btn"
                    onClick={handleSubmit}
                    disabled={username.trim().length === 0 || loading}
                >
                    {loading ? '...' : '→'}
                </button>
            </div>
        </div>
    );
}