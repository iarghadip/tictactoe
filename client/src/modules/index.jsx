import PairPage from './Pair/Page';
import GamePage from './Game/Page';
import RoomPage from './Room/Page';
import MemberPage from './Member/Page';
import RankPage from './Rank/Page';
import ControlPage from './Control/Page';
import AboutPage from './About/Page';
import HomePage from './Home/Page';

export default function Screen({
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