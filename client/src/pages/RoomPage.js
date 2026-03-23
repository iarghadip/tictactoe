import { useEffect, useState, useCallback } from 'react';
import { useNakama } from '../contexts/nakamaContext';
import { RoomScreen } from '../screens/room';

export default function RoomPage({ onBack, onRoomMatch }) {
    const { client, session, account } = useNakama();
    const [rooms, setRooms] = useState([]);
    const [requestedRooms, setRequestedRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomMembers, setRoomMembers] = useState([]);
    const [pendingMembers, setPendingMembers] = useState([]);
    const [createError, setCreateError] = useState(null);
    const [joinError, setJoinError] = useState(null);

    const myUserId = account?.user?.id;

    const fetchRooms = useCallback(async () => {
        try {
            const result = await client.listUserGroups(session, myUserId, 100);
            setRooms(result.user_groups?.filter(rg => rg.state <= 2) || []);
            setRequestedRooms(result.user_groups?.filter(rg => rg.state === 3) || []);
        } catch (e) {}
    }, [client, session, myUserId]);

    const fetchMembers = useCallback(async (groupId) => {
        try {
            const result = await client.listGroupUsers(session, groupId, 100);
            const members = result.group_users?.filter(u => u.state <= 2) || [];
            const pending = result.group_users?.filter(u => u.state === 3) || [];
            setRoomMembers(members);
            setPendingMembers(pending);
        } catch (e) {}
    }, [client, session]);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    useEffect(() => {
        if (selectedRoom) {
            fetchMembers(selectedRoom.id);
        }
    }, [selectedRoom, fetchMembers]);

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
            const result = await client.listGroups(session, name, 1);
            const targetGroup = result.groups?.find(g => g.name.toLowerCase() === name.toLowerCase());
            
            if (!targetGroup) {
                setJoinError('Room not found.');
                return;
            }
            await client.joinGroup(session, targetGroup.id);
            fetchRooms(); 
            onSuccess();
        } catch (e) {
            setJoinError(e.message || 'Already joined or requested!');
        }
    };

    const handleApprove = async (groupId, userId) => {
        try {
            await client.addGroupUsers(session, groupId, [userId]);
            fetchMembers(groupId);
        } catch (e) {}
    };

    const handleKick = async (groupId, userId) => {
        try {
            await client.kickGroupUsers(session, groupId, [userId]);
            fetchMembers(groupId);
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