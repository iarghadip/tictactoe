import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Client, Session } from '@heroiclabs/nakama-js';

const NakamaContext = createContext(null);

export function NakamaProvider({ children }) {
    const [client] = useState(() => new Client(
        process.env.REACT_APP_NAKAMA_KEY,
        process.env.REACT_APP_NAKAMA_HOST,
        process.env.REACT_APP_NAKAMA_PORT,
        process.env.REACT_APP_ENVIRONMENT === 'production'
    ));
    const [session, setSession] = useState(null);
    const [socket, setSocket] = useState(null);
    const [account, setAccount] = useState(null);
    const [restoring, setRestoring] = useState(true);
    const connectingRef = useRef(false);
    const socketRef = useRef(null);

    const fetchAccount = async (s) => {
        const acc = await client.getAccount(s);
        setAccount(acc);
    };

    const connectSocket = async (s) => {
        if (connectingRef.current) return;
        if (socketRef.current) {
            try { socketRef.current.disconnect(); } catch (_) {}
        }
        connectingRef.current = true;
        try {
            const newSocket = client.createSocket(false, false);
            await newSocket.connect(s, true);
            socketRef.current = newSocket;
            setSocket(newSocket);
        } finally {
            connectingRef.current = false;
        }
    };

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
                    await fetchAccount(restored);
                    await connectSocket(restored);
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

    const connect = async (username) => {
        const newSession = await client.authenticateCustom(username.toLowerCase(), true, username);
        localStorage.setItem('nk_token', newSession.token);
        localStorage.setItem('nk_refresh_token', newSession.refresh_token);
        setSession(newSession);
        await fetchAccount(newSession);
        await connectSocket(newSession);
    };

    const updateDisplayName = async (displayName) => {
        await client.updateAccount(session, { displayName });
        await fetchAccount(session);
    };

    const disconnect = () => {
        localStorage.removeItem('nk_token');
        localStorage.removeItem('nk_refresh_token');
        if (socketRef.current) {
            try { socketRef.current.disconnect(); } catch (_) {}
            socketRef.current = null;
        }
        setSession(null);
        setSocket(null);
        setAccount(null);
    };

    return (
        <NakamaContext.Provider value={{ client, session, socket, account, connect, updateDisplayName, disconnect, restoring }}>
            {children}
        </NakamaContext.Provider>
    );
}

export function useNakama() {
    return useContext(NakamaContext);
}