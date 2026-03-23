import { useState } from 'react';
import { useNakama } from '../contexts/nakamaContext';
import { HomeScreen } from '../screens/home';
import { MenuInput } from '../components/input';

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

    const executeAction = (index) => {
        switch (index) {
            case 0: onFindMatch('timed'); break;
            case 1: onFindMatch('classic'); break;
            case 2: break;
            case 3: onGlobalRanks(); break;
            case 4: setNameError(null); setNameModal(true); break;
            case 5: onAbout(); break;
        }
    };

    const requireAuth = (index) => {
        if (session) {
            executeAction(index);
        } else {
            setPendingAction(index);
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
                onMenuSelect={requireAuth}
                onLogout={disconnect}
            />
            <MenuInput
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
            <MenuInput
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