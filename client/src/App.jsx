import { useState, useEffect } from 'react';
import { useNakama } from './contexts/nakamaContext';
import Screen from './modules';

export default function App() {
    const { restoring, session } = useNakama();

    const [state, setState] = useState({
        page: 'HomePage',
        match: null,
        mode: localStorage.getItem('mode') || 'timed',
        matchRoomId: null,
        selectedRoom: null,
    });

    const setAppState = (updates) => {
        setState((prev) => ({ ...prev, ...updates }));
    };

    useEffect(() => {
        if (!restoring && session && localStorage.getItem('playing') === 'true') {
            localStorage.removeItem('playing');
            setAppState({ page: 'PairPage' });
        }
    }, [restoring, session]);

    if (restoring) return null;

    const handleFindMatch = (selectedMode, roomId = null) => {
        localStorage.setItem('mode', selectedMode);
        setAppState({
            mode: selectedMode,
            matchRoomId: roomId,
            page: 'PairPage',
        });
    };

    const handleFound = (foundMatch) => {
        localStorage.setItem('GamePage', 'true');
        setAppState({
            match: foundMatch,
            page: 'GamePage',
        });
    };

    const handleLeave = () => {
        localStorage.removeItem('playing');
        setAppState({
            match: null,
            page: 'PairPage',
        });
    };

    const handleSelectRoom = (room) => {
        setAppState({
            selectedRoom: room,
            page: 'MemberPage',
        });
    };

    return (
        <Screen
            {...state}
            handleFindMatch={handleFindMatch}
            handleFound={handleFound}
            handleLeave={handleLeave}
            handleSelectRoom={handleSelectRoom}
            setAppState={setAppState}
        />
    );
}