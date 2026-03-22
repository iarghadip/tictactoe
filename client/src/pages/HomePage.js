import { useState } from 'react';
import { useNakama } from '../contexts/nakamaContext';
import { HomeScreen } from '../screens/home';
import { Enter } from '../components/enter';

export default function HomePage({ onFindMatch, onGlobalRanks, onAbout }) {
    const { session, connect, updateDisplayName, disconnect, account } = useNakama();

    const [authModal, setAuthModal] = useState(false);
    const [nameModal, setNameModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [nameLoading, setNameLoading] = useState(false);
    const [nameError, setNameError] = useState(null);

    const displayName = account?.user?.display_name || 'Anonymous';
    const rawDisplayName = account?.user?.display_name || '';

    const executeAction = (action) => {
        switch (action) {
            case 'timed':
            case 'classic':
                onFindMatch(action);
                break;
            case 'name-settings':
                setNameError(null);
                setNameModal(true);
                break;
            case 'ranks':
                onGlobalRanks();
                break;
            case 'about':
                onAbout();
                break;
            default:
                break;
        }
    };

    const requireAuth = (action) => {
        if (session) {
            executeAction(action);
        } else {
            setPendingAction(action);
            setAuthError(null);
            setAuthModal(true);
        }
    };

    const handleAuth = async ({ username }) => {
        setAuthLoading(true);
        setAuthError(null);
        try {
            await connect(username.trim());
            setAuthModal(false);
            const action = pendingAction;
            setPendingAction(null);
            executeAction(action);
        } catch (e) {
            setAuthError(e.message || 'Choose a different username!');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleNameUpdate = async ({ displayName: newName }) => {
        setNameLoading(true);
        setNameError(null);
        try {
            await updateDisplayName(newName.trim() || '');
            setNameModal(false);
        } catch (e) {
            setNameError(e.message || 'Failed to update name.');
        } finally {
            setNameLoading(false);
        }
    };

    const handleAuthClose = () => {
        setAuthModal(false);
        setPendingAction(null);
        setAuthError(null);
    };

    const handleNameClose = () => {
        setNameModal(false);
        setNameError(null);
    };

    return (
        <>
            <HomeScreen
                displayName={displayName}
                isLoggedIn={!!session}
                onTimedMatch={() => requireAuth('timed')}
                onClassicMatch={() => requireAuth('classic')}
                onExploreRooms={() => requireAuth('explore')}
                onGlobalRanks={() => requireAuth('ranks')}
                onNameSettings={() => requireAuth('name-settings')}
                onAbout={() => executeAction('about')}
                onLogout={disconnect}
            />
            <Enter
                open={authModal}
                title="Who are you?"
                fields={[
                    { key: 'username', placeholder: 'Username', maxLength: 10, autoFocus: true }
                ]}
                onSubmit={handleAuth}
                onClose={handleAuthClose}
                loading={authLoading}
                error={authError}
            />
            <Enter
                open={nameModal}
                title="Name Settings"
                fields={[
                    { key: 'displayName', placeholder: 'Display name', maxLength: 10, autoFocus: true }
                ]}
                initialValues={{ displayName: rawDisplayName }}
                onSubmit={handleNameUpdate}
                onClose={handleNameClose}
                loading={nameLoading}
                error={nameError}
            />
        </>
    );
}