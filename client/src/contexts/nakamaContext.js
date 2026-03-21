import { createContext, useContext, useState, useEffect } from 'react';
import { Client, Session } from '@heroiclabs/nakama-js';

const NakamaContext = createContext(null);

export function NakamaProvider({ children }) {

    const [client] = useState(() => new Client('defaultkey', 'localhost', '7350', false));
    const [session, setSession] = useState(null);
    const [socket, setSocket] = useState(null);
    const [restoring, setRestoring] = useState(true);

    useEffect(() => {
        const restore = async () => {
            try {
                const token = localStorage.getItem('nk_token');
                const refreshToken = localStorage.getItem('nk_refresh_token');

                if (token && refreshToken) {
                    let restored = Session.restore(token, refreshToken);

                    if (restored.isexpired(Date.now() / 1000)) {
                        restored = await client.sessionRefresh(restored);
                        localStorage.setItem('nk_token', restored.token);
                        localStorage.setItem('nk_refresh_token', restored.refresh_token);
                    }

                    setSession(restored);
                    const newSocket = client.createSocket(false, false);
                    await newSocket.connect(restored, true);
                    setSocket(newSocket);
                }
            } catch (e) {
                localStorage.removeItem('nk_token');
                localStorage.removeItem('nk_refresh_token');
            } finally {
                setRestoring(false);
            }
        };

        restore();
    }, [client]);

    const connect = async (username, displayName) => {
        const newSession = await client.authenticateCustom(username.toLowerCase(), true, username);
        localStorage.setItem('nk_token', newSession.token);
        localStorage.setItem('nk_refresh_token', newSession.refresh_token);
        await client.updateAccount(newSession, { displayName });
        setSession(newSession);
        const newSocket = client.createSocket(false, false);
        await newSocket.connect(newSession, true);
        setSocket(newSocket);
    };

    const disconnect = () => {
        localStorage.removeItem('nk_token');
        localStorage.removeItem('nk_refresh_token');
        setSession(null);
        setSocket(null);
    };

    return (
        <NakamaContext.Provider value={{ client, session, socket, connect, disconnect, restoring }}>
            {children}
        </NakamaContext.Provider>
    );
}

export function useNakama() {
    return useContext(NakamaContext);
}