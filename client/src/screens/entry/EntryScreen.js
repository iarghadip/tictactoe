import { useState } from 'react';
import './EntryScreen.css';

export default function EntryScreen({ onDone, loading, error }) {
    const [name, setName] = useState('');

    function handleSubmit() {
        onDone(name.trim());
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') handleSubmit();
    }

    return (
        <div className="name-entry">
            <div className="name-entry__container">
                <div className="name-entry__title">What's your username?</div>
                <div className="name-entry__row">
                    <input
                        className="name-entry__input"
                        type="text"
                        placeholder="Player1"
                        maxLength={10}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    <button
                        className="name-entry__btn"
                        onClick={handleSubmit}
                        disabled={name.trim().length === 0 || loading}
                    >
                        {loading ? '...' : '→'}
                    </button>
                </div>
                {error && <p className="name-entry__error">{error}</p>}
            </div>
        </div>
    );
}