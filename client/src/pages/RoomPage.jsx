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
    const joinedChannelIdsRef = useRef([]);
    const joinedRoomIdsRef = useRef(new Set());

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
        if (!socket || rooms.length === 0) return;

        let alive = true;

        const joinNew = async () => {
            for (const r of rooms) {
                const groupId = r.group.id;
                if (joinedRoomIdsRef.current.has(groupId)) continue;

                try {
                    const channel = await socket.joinChat(groupId, 3, false, false);
                    if (!alive) {
                        socket.leaveChat(channel.id).catch(() => {});
                        return;
                    }
                    joinedChannelIdsRef.current.push(channel.id);
                    joinedRoomIdsRef.current.add(groupId);
                } catch (e) {
                    console.warn('RoomPage: Room was deleted.', e);
                }
            }
        };

        joinNew();

        const prevMessage  = socket.onchannelmessage;
        const prevPresence = socket.onchannelpresence;

        socket.onchannelmessage  = () => fetchRooms();
        socket.onchannelpresence = () => fetchRooms();

        return () => {
            alive = false;
            socket.onchannelmessage  = prevMessage;
            socket.onchannelpresence = prevPresence;
        };
    }, [socket, rooms, fetchRooms]);

    useEffect(() => {
        return () => {
            if (!socket) return;
            joinedChannelIdsRef.current.forEach(id => socket.leaveChat(id).catch(() => {}));
            joinedChannelIdsRef.current = [];
            joinedRoomIdsRef.current.clear();
        };
    }, []);

    useEffect(() => {
        if (!socket) return;
        const prev = socket.onnotification;
        socket.onnotification = () => { fetchRooms(); };
        return () => { socket.onnotification = prev; };
    }, [socket, fetchRooms]);

    const handleCreateRoom = async (name, onSuccess) => {
        setCreateError(null);
        try {
            await client.rpc(session, 'create_room', name.trim());
            await fetchRooms();
            onSuccess();
        } catch (e) {
            let errorText = 'Failed to create room!';
            let rawString = String(e);

            if (e instanceof Response) {
                try {
                    const errObj = await e.json();
                    rawString = errObj.message || errObj.error || String(errObj);
                } catch (_) {
                    try { rawString = await e.text(); } catch (_) {}
                }
            } else if (e?.message) {
                rawString = e.message;
            }

            if (rawString.includes('already exists') || rawString.includes('already in use')) {
                errorText = 'Room name already exists!';
            } else {
                errorText = rawString.replace('Error: ', '');
            }

            setCreateError(errorText);
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
            let errorText = 'Failed to join room!';
            let rawString = String(e);

            if (e instanceof Response) {
                try {
                    const errObj = await e.json();
                    rawString = errObj.message || errObj.error || String(errObj);
                } catch (_) {
                    try { rawString = await e.text(); } catch (_) {}
                }
            } else if (e?.message) {
                rawString = e.message;
            }

            errorText = rawString.replace('Error: ', '');
            setJoinError(errorText);
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