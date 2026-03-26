import { useEffect, useState, useCallback, useRef } from 'react';
import { useNakama } from '../../contexts/nakamaContext';
import { Input } from '../../components/input';
import Screen from './Screen';

export default function RoomPage({ onBack, onSelectRoom }) {
    const { client, session, account, socket } = useNakama();
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState([]);
    const [requestedRooms, setRequestedRooms] = useState([]);
    const [createError, setCreateError] = useState(null);
    const [joinError, setJoinError] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

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
    }, [socket]);

    useEffect(() => {
        if (!socket) return;
        const prev = socket.onnotification;
        socket.onnotification = () => { fetchRooms(); };
        return () => { socket.onnotification = prev; };
    }, [socket, fetchRooms]);

    const handleCreateRoom = async (name, onSuccess) => {
        setCreateError(null);
        setIsCreating(true);
        try {
            await client.rpc(session, 'create_room', name.trim());
            await fetchRooms();
            onSuccess();
        } catch (e) {
            setCreateError(e.message || 'Failed to create room!');
        } finally {
            setIsCreating(false);
        }
    };

    const handleRequestJoin = async (name, onSuccess) => {
        setJoinError(null);
        setIsJoining(true);
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
            setJoinError(e.message || 'Failed to join room!');
        } finally {
            setIsJoining(false);
        }
    };

    const clearErrors = () => {
        setCreateError(null);
        setJoinError(null);
    };

    return (
        <>
            <Screen
                loading={loading}
                rooms={rooms}
                requestedRooms={requestedRooms}
                onSelectRoom={onSelectRoom}
                onBack={onBack}
                onOpenCreate={() => setCreateOpen(true)}
                onOpenJoin={() => setJoinOpen(true)}
            />
            <Input
                open={createOpen}
                title="Create Room"
                fields={[{ key: 'name', placeholder: 'Room Name' }]}
                onSubmit={(v) => { handleCreateRoom(v.name, () => setCreateOpen(false)); }}
                onClose={() => { setCreateOpen(false); clearErrors(); }}
                loading={isCreating}
                error={createError}
            />
            <Input
                open={joinOpen}
                title="Join Room"
                fields={[{ key: 'name', placeholder: 'Room Name' }]}
                onSubmit={(v) => { handleRequestJoin(v.name, () => setJoinOpen(false)); }}
                onClose={() => { setJoinOpen(false); clearErrors(); }}
                loading={isJoining}
                error={joinError}
            />
        </>
    );
}