import { useState, useEffect } from 'react';
import { useNakama } from './contexts/nakamaContext';

import RankPage from './pages/RankPage';
import RoomPage from './pages/RoomPage';
import MemberPage from './pages/MemberPage';

import HomePage from './modules/Home/Page';
import PairPage from './modules/Pair/Page';
import GamePage from './modules/Game/Page';

import ControlPage from './modules/Control/Page';
import AboutPage from './modules/About/Page';

export default function App() {
    const { restoring, session } = useNakama();
    const [step, setStep] = useState('home');
    const [match, setMatch] = useState(null);
    const [mode, setMode] = useState(() => localStorage.getItem('nk_mode') || 'timed');
    const [matchRoomId, setMatchRoomId] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);

    useEffect(() => {
        if (!restoring && session && localStorage.getItem('nk_in_match') === 'true') {
            localStorage.removeItem('nk_in_match');
            setStep('pair');
        }
    }, [restoring, session]);

    if (restoring) return null;

    const handleFindMatch = (selectedMode, roomId = null) => {
        localStorage.setItem('nk_mode', selectedMode);
        setMode(selectedMode);
        setMatchRoomId(roomId);
        setStep('pair');
    };

    const handleFound = (foundMatch) => {
        localStorage.setItem('nk_in_match', 'true');
        setMatch(foundMatch);
        setStep('game');
    };

    const handleLeave = () => {
        localStorage.removeItem('nk_in_match');
        setMatch(null);
        setStep('pair');
    };

    const handleSelectRoom = (room) => {
        setSelectedRoom(room);
        setStep('member');
    };

    if (step === 'pair') {
        return (
            <PairPage
                mode={mode}
                roomId={matchRoomId}
                onFound={handleFound}
                onCancel={() => setStep(matchRoomId ? 'room' : 'home')}
            />
        );
    }

    if (step === 'game' && match) {
        return (
            <GamePage
                match={match}
                onLeave={handleLeave}
            />
        );
    }

    if (step === 'rank') {
        return (
            <RankPage
                onBack={() => setStep('home')}
            />
        );
    }

    if (step === 'about') {
        return (
            <AboutPage
                onBack={() => setStep('home')}
            />
        );
    }

    if (step === 'room') {
        return (
            <RoomPage
                onBack={() => setStep('home')}
                onSelectRoom={handleSelectRoom}
            />
        );
    }

    if (step === 'member' && selectedRoom) {
        return (
            <MemberPage
                room={selectedRoom}
                onBack={() => setStep('room')}
                onRoomMatch={(selectedMode, roomId) => handleFindMatch(selectedMode, roomId)}
            />
        );
    }

    if (step === 'control') {
        return (
            <ControlPage
                onBack={() => setStep('home')}
            />
        );
    }

    return (
        <HomePage
            onFindMatch={handleFindMatch}
            onGlobalRanks={() => setStep('rank')}
            onAbout={() => setStep('about')}
            onRooms={() => setStep('room')}
            onSettings={() => setStep('control')}
        />
    );
}