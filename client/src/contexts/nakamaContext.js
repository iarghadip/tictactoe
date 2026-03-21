import { createContext, useContext, useState } from 'react';
import { Client } from '@heroiclabs/nakama-js';

const NakamaContext = createContext(null);

export function NakamaProvider({ children }) {
    const [client]  = useState(() => new Client('defaultkey', 'localhost', '7350', false));
    const [session, setSession] = useState(null);
    const [socket,  setSocket]  = useState(null);

    const connect = async (username) => {
        const newSession = await client.authenticateCustom(username.toLowerCase(), true, username);
        setSession(newSession);

        const newSocket = client.createSocket(false, false);
        await newSocket.connect(newSession, true);
        setSocket(newSocket);
    };

    return (
        <NakamaContext.Provider value={{ client, session, socket, connect }}>
            {children}
        </NakamaContext.Provider>
    );
}

export function useNakama() {
    return useContext(NakamaContext);
}