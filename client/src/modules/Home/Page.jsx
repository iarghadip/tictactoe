import { useState, useEffect } from 'react';
import { useNakama } from '../../contexts/nakamaContext';
import { Input } from '../../components/input';
import { HOME_SCREEN_MENU } from '../../constants/menus';
import Screen from './Screen';

export default function HomePage({
    onFindMatch, onGlobalRanks, onAbout, onRooms, onSettings
}) {
    const { session, connect, disconnect, account } = useNakama();

    const [authModal, setAuthModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState(null);

    const displayName = account?.user?.display_name || 'Anonymous';

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername && !session) {
            setAuthLoading(true);
            connect(storedUsername)
                .catch(e => {
                    console.error("Auto-login failed:", e);
                })
                .finally(() => setAuthLoading(false));
        }
    }, [session, connect]);

    const executeAction = (index) => {
        switch (index) {
            case 0: onFindMatch('timed'); break;
            case 1: onFindMatch('classic'); break;
            case 2: onRooms(); break;
            case 3: onGlobalRanks(); break;
            case 4: onSettings(); break;
            case 5: onAbout(); break;
            default: break;
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
        const cleanUsername = username.trim();

        if (cleanUsername.length < 6) {
            setAuthError('Username is too short!');
            return;
        }

        setAuthLoading(true);
        setAuthError(null);
        try {
            await connect(cleanUsername);

            localStorage.setItem('username', cleanUsername);

            setAuthModal(false);
            const action = pendingAction;
            setPendingAction(null);
            
            if (action !== null) {
                executeAction(action);
            }
        } catch (e) {
            setAuthError(e.message);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleAuthClose = () => {
        setAuthModal(false);
        setPendingAction(null);
        setAuthError(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('username');
        disconnect();
    };

    const menuItems = HOME_SCREEN_MENU.flatMap((group, gi) =>
        group.items.map(item => ({ ...item, gi }))
    );

    return (
        <>
            <Screen
                displayName={displayName}
                isLoggedIn={!!session}
                menuItems={menuItems}
                onMenuSelect={requireAuth}
                onLogout={handleLogout}
            />
            <Input
                open={authModal}
                title="Who are you?"
                fields={[{ key: 'username', placeholder: 'User Name' }]}
                onSubmit={handleAuth}
                onClose={handleAuthClose}
                loading={authLoading}
                error={authError}
            />
        </>
    );
}