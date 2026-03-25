import { useState } from 'react';
import { useNakama } from '../contexts/nakamaContext';
import { HomeScreen } from '../screens/home';
import { MenuInput } from '../components/input';
import { HOME_SCREEN_MENU } from '../constants/menus';

export default function HomePage({
    onFindMatch, onGlobalRanks, onAbout, onRooms, onSettings
}) {
    const { session, connect, disconnect, account } = useNakama();

    const [authModal, setAuthModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState(null);

    const displayName = account?.user?.display_name || 'Anonymous';

    const executeAction = (index) => {
        switch (index) {
            case 0: onFindMatch('timed'); break;
            case 1: onFindMatch('classic'); break;
            case 2: onRooms(); break;
            case 3: onGlobalRanks(); break;
            case 4: onSettings(); break;
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

    const menuItems = [];
    HOME_SCREEN_MENU.forEach((group, gi) => {
        group.items.forEach((item) => menuItems.push({ ...item, gi }));
    });

    return (
        <>
            <HomeScreen
                displayName={displayName}
                isLoggedIn={!!session}
                menuItems={menuItems}
                onMenuSelect={requireAuth}
                onLogout={disconnect}
            />
            <MenuInput
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