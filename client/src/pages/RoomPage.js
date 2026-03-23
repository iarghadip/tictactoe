import { useEffect, useState, useCallback } from 'react';
import { useNakama } from '../contexts/nakamaContext';
import { RoomScreen } from '../screens/room';

export default function RoomPage({ onBack, onRoomMatch }) {
    const { client, session, account } = useNakama();
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState([]);
    const [requestedRooms, setRequestedRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomMembers, setRoomMembers] = useState([]);
    const [pendingMembers, setPendingMembers] = useState([]);
    const [createError, setCreateError] = useState(null);
    const [joinError, setJoinError] = useState(null);

    const myUserId = account?.user?.id;

    const fetchRooms = useCallback(async () => {
        setLoading(true);
        try {
            const result = await client.listUserGroups(session, myUserId, 100);
            setRooms(result.user_groups?.filter(rg => rg.state <= 2) || []);
            setRequestedRooms(result.user_groups?.filter(rg => rg.state === 3) || []);
        } catch (e) {} finally {
            setLoading(false);
        }
    }, [client, session, myUserId]);

    const fetchMembers = useCallback(async (groupId, isAdmin) => {
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
            console.error("Failed to fetch members:", e);
        }
    }, [client, session]);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    useEffect(() => {
        if (selectedRoom) {
            fetchMembers(selectedRoom.id, selectedRoom.creator_id === myUserId);
        }
    }, [selectedRoom, fetchMembers, myUserId]);

    const handleCreateRoom = async (name, onSuccess) => {
        setCreateError(null);
        const ownedCount = rooms.filter(r => r.group.creator_id === myUserId).length;
        if (ownedCount >= 5) {
            setCreateError('You can only create up to 5 rooms.');
            return;
        }
        try {
            await client.createGroup(session, { name, max_count: 100, open: false });
            fetchRooms();
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
                setJoinError('Room does not exists!');
                return;
            }
            await client.joinGroup(session, targetGroup.id);
            fetchRooms(); 
            onSuccess();
        } catch (e) {
            setJoinError(e.message);
        }
    };

    const handleApprove = async (groupId, userId) => {
        try {
            await client.addGroupUsers(session, groupId, [userId]);
            fetchMembers(groupId, true);
        } catch (e) {}
    };

    const handleKick = async (groupId, userId) => {
        try {
            await client.kickGroupUsers(session, groupId, [userId]);
            fetchMembers(groupId, true);
        } catch (e) {}
    };

    const handleLeave = async (groupId) => {
        try {
            await client.leaveGroup(session, groupId);
            setSelectedRoom(null);
            fetchRooms();
        } catch (e) {}
    };

    const handleDelete = async (groupId) => {
        try {
            await client.deleteGroup(session, groupId);
            setSelectedRoom(null);
            fetchRooms();
        } catch (e) {}
    };

    const clearErrors = () => {
        setCreateError(null);
        setJoinError(null);
    };

    return (
        <RoomScreen
            loading={loading}
            myUserId={myUserId}
            rooms={rooms}
            requestedRooms={requestedRooms}
            selectedRoom={selectedRoom}
            roomMembers={roomMembers}
            pendingMembers={pendingMembers}
            onSelectRoom={setSelectedRoom}
            onBack={onBack}
            onCreateRoom={handleCreateRoom}
            onRequestJoin={handleRequestJoin}
            onApprove={handleApprove}
            onKick={handleKick}
            onLeave={handleLeave}
            onDelete={handleDelete}
            onStartRoomMatch={onRoomMatch}
            createError={createError}
            joinError={joinError}
            clearErrors={clearErrors}
        />
    );
}