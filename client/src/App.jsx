import { useState, useEffect } from 'react';
import { useNakama } from './contexts/nakamaContext';
import PairPage from './modules/Pair/Page';
import GamePage from './modules/Game/Page';
import RoomPage from './modules/Room/Page';
import MemberPage from './modules/Member/Page';
import RankPage from './modules/Rank/Page';
import ControlPage from './modules/Control/Page';
import AboutPage from './modules/About/Page';
import HomePage from './modules/Home/Page';

function Screen({
    page, match, mode, matchRoomId, selectedRoom, setAppState,
    handleFindMatch, handleFound, handleLeave, handleSelectRoom
}) {
    if (page === 'PairPage') {
        return (
            <PairPage
                mode={mode}
                roomId={matchRoomId}
                onFound={handleFound}
                onCancel={() => setAppState({ page: matchRoomId ? 'RoomPage' : 'HomePage' })}
            />
        );
    } else if (page === 'GamePage') {
        return (
            <GamePage
                match={match}
                onLeave={handleLeave}
            />
        );
    } else if (page === 'RoomPage') {
        return (
            <RoomPage
                onBack={() => setAppState({ page: 'HomePage' })}
                onSelectRoom={handleSelectRoom}
            />
        );
    } else if (page === 'MemberPage') {
        return (
            <MemberPage
                room={selectedRoom}
                onBack={() => setAppState({ page: 'RoomPage' })}
                onRoomMatch={handleFindMatch}
            />
        );
    } else if (page === 'RankPage') {
        return (
            <RankPage
                onBack={() => setAppState({ page: 'HomePage' })}
            />
        );
    } else if (page === 'ControlPage') {
        return (
            <ControlPage
                onBack={() => setAppState({ page: 'HomePage' })}
            />
        );
    } else if (page === 'AboutPage') {
        return (
            <AboutPage
                onBack={() => setAppState({ page: 'HomePage' })}
            />
        );
    } else {
        return (
            <HomePage
                onFindMatch={handleFindMatch}
                onGlobalRanks={() => setAppState({ page: 'RankPage' })}
                onAbout={() => setAppState({ page: 'AboutPage' })}
                onRooms={() => setAppState({ page: 'RoomPage' })}
                onSettings={() => setAppState({ page: 'ControlPage' })}
            />
        );
    }
}

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