import { useEffect, useState, useCallback, useRef } from 'react';
import { useNakama } from '../contexts/nakamaContext';
import { RoomScreen, MemberScreen } from '../screens/room';

export default function RoomPage({ onBack, onRoomMatch }) {
    const { client, session, account, socket } = useNakama();
    const [loading, setLoading] = useState(true);
    const [membersLoading, setMembersLoading] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [requestedRooms, setRequestedRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomMembers, setRoomMembers] = useState([]);
    const [pendingMembers, setPendingMembers] = useState([]);
    const [createError, setCreateError] = useState(null);
    const [joinError, setJoinError] = useState(null);

    const myUserId = account?.user?.id;
    const selectedRoomRef = useRef(null);
    useEffect(() => { selectedRoomRef.current = selectedRoom; }, [selectedRoom]);

    const handleSelectRoom = useCallback((room) => {
        setSelectedRoom(room);
        setRoomMembers([]);
        setPendingMembers([]);
        if (room) setMembersLoading(true);
    }, []);

    const fetchMembers = useCallback(async (groupId, isAdmin, silent = false) => {
        if (!silent) setMembersLoading(true);
        try {
            const result = await client.listGroupUsers(session, groupId, undefined, 100);
            setRoomMembers(result.group_users?.filter(u => u.state <= 2) || []);
            if (isAdmin) {
                const pendingResult = await client.listGroupUsers(session, groupId, 3, 100);
                setPendingMembers(pendingResult.group_users || []);
            } else {
                setPendingMembers([]);
            }
        } catch (e) {
            console.error('Failed to fetch members:', e);
        } finally {
            if (!silent) setMembersLoading(false);
        }
    }, [client, session]);

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
        if (!selectedRoom) return;
        fetchMembers(selectedRoom.id, selectedRoom.creator_id === myUserId);
    }, [selectedRoom, fetchMembers, myUserId]);

    useEffect(() => {
        if (!socket) return;

        const prev = socket.onnotification;

        socket.onnotification = async () => {
            const joined = await fetchRooms();
            if (!joined) return;

            const current = selectedRoomRef.current;
            if (!current) return;

            const stillMember = joined.some(r => r.group.id === current.id);
            if (!stillMember) {
                setSelectedRoom(null);
                setRoomMembers([]);
                setPendingMembers([]);
            } else {
                fetchMembers(current.id, current.creator_id === myUserId, true);
            }
        };

        return () => { socket.onnotification = prev; };
    }, [socket, fetchRooms, fetchMembers, myUserId]);

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

    const handleApprove = async (groupId, userId) => {
        try {
            await client.addGroupUsers(session, groupId, [userId]);
            fetchMembers(groupId, true, true);
        } catch (e) {
            console.error('Failed to approve member:', e);
        }
    };

    const handleKick = async (groupId, userId) => {
        try {
            await client.kickGroupUsers(session, groupId, [userId]);
            fetchMembers(groupId, true, true);
        } catch (e) {
            console.error('Failed to kick member:', e);
        }
    };

    const handleLeave = async (groupId) => {
        try {
            await client.leaveGroup(session, groupId);
            handleSelectRoom(null);
            fetchRooms();
        } catch (e) {
            console.error('Failed to leave room:', e);
        }
    };

    const handleDelete = async (groupId) => {
        try {
            await client.deleteGroup(session, groupId);
            handleSelectRoom(null);
            fetchRooms();
        } catch (e) {
            console.error('Failed to delete room:', e);
        }
    };

    const clearErrors = () => {
        setCreateError(null);
        setJoinError(null);
    };

    if (selectedRoom) {
        return (
            <MemberScreen
                loading={membersLoading}
                myUserId={myUserId}
                selectedRoom={selectedRoom}
                roomMembers={roomMembers}
                pendingMembers={pendingMembers}
                onBack={() => handleSelectRoom(null)}
                onApprove={handleApprove}
                onKick={handleKick}
                onLeave={handleLeave}
                onDelete={handleDelete}
                onStartRoomMatch={onRoomMatch}
            />
        );
    }

    return (
        <RoomScreen
            loading={loading}
            rooms={rooms}
            requestedRooms={requestedRooms}
            onSelectRoom={handleSelectRoom}
            onBack={onBack}
            onCreateRoom={handleCreateRoom}
            onRequestJoin={handleRequestJoin}
            createError={createError}
            joinError={joinError}
            clearErrors={clearErrors}
        />
    );
}