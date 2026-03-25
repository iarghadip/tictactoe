import { useEffect, useState, useCallback, useRef } from 'react';
import { useNakama } from '../contexts/nakamaContext';
import { RoomScreen } from '../screens/room';

export default function RoomPage({ onBack, onSelectRoom, onRoomMatch }) {
    const { client, session, account, socket } = useNakama();
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState([]);
    const [requestedRooms, setRequestedRooms] = useState([]);
    const [createError, setCreateError] = useState(null);
    const [joinError, setJoinError] = useState(null);

    const myUserId = account?.user?.id;

    const fetchRooms = useCallback(async () => {
        try {
            const result = await client.listUserGroups(session, myUserId, 100);
            const joined = result.user_groups?.filter(rg => rg.state <= 2) || [];
            const requested = result.user_groups?.filter(rg => rg.state === 3) || [];
            setRooms(joined);
            setRequestedRooms(requested);
            return joined;
        } catch (e) {
            console.error('Failed to fetch rooms:', e);
            return null;
        } finally {
            setLoading(false);
        }
    }, [client, session, myUserId]);

    useEffect(() => { fetchRooms(); }, [fetchRooms]);
    
    useEffect(() => {
        if (!socket) return;
        const prev = socket.onnotification;

        socket.onnotification = async () => {
            await fetchRooms();
        };

        return () => { socket.onnotification = prev; };
    }, [socket, fetchRooms]);

    const handleCreateRoom = async (name, onSuccess) => {
        setCreateError(null);
        const ownedCount = rooms.filter(r => r.group.creator_id === myUserId).length;
        if (ownedCount >= 5) {
            setCreateError('You can only create up to 5 rooms.');
            return;
        }
        try {
            await client.createGroup(session, { name, max_count: 100, open: false });
            await fetchRooms();
            onSuccess();
        } catch (e) {
            setCreateError(e.message || 'Room name already exists!');
        }
    };

    const handleRequestJoin = async (name, onSuccess) => {
        setJoinError(null);
        try {
            const result = await client.listGroups(session, name, undefined, 1);
            const targetGroup = result.groups?.find(g => g.name.toLowerCase() === name.toLowerCase());
            if (!targetGroup) {
                setJoinError('Room does not exist!');
                return;
            }
            await client.joinGroup(session, targetGroup.id);
            await fetchRooms();
            onSuccess();
        } catch (e) {
            setJoinError(e.message);
        }
    };

    const clearErrors = () => {
        setCreateError(null);
        setJoinError(null);
    };

    return (
        <RoomScreen
            loading={loading}
            rooms={rooms}
            requestedRooms={requestedRooms}
            onSelectRoom={onSelectRoom}
            onBack={onBack}
            onCreateRoom={handleCreateRoom}
            onRequestJoin={handleRequestJoin}
            createError={createError}
            joinError={joinError}
            clearErrors={clearErrors}
        />
    );
}