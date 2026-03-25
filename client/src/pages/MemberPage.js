import { useEffect, useState, useCallback, useRef } from 'react';
import { useNakama } from '../contexts/nakamaContext';
import { MemberScreen } from '../screens/member';

export default function MemberPage({ room, onBack, onRoomMatch }) {
    const { client, session, account, socket } = useNakama();
    const [loading, setLoading] = useState(true);
    const [roomMembers, setRoomMembers] = useState([]);
    const [pendingMembers, setPendingMembers] = useState([]);
    const [roomDeleted, setRoomDeleted] = useState(false);
    const [edgeCount, setEdgeCount] = useState(room.edge_count);

    const myUserId = account?.user?.id;
    const isAdmin = room.creator_id === myUserId;

    const roomRef = useRef(room);
    useEffect(() => { roomRef.current = room; }, [room]);

    const fetchMembers = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const result = await client.listGroupUsers(session, room.id, undefined, 100);
            const active = result.group_users?.filter(u => u.state <= 2) || [];
            setRoomMembers(active);
            setEdgeCount(active.length);

            if (isAdmin) {
                const pendingResult = await client.listGroupUsers(session, room.id, 3, 100);
                setPendingMembers(pendingResult.group_users || []);
            } else {
                setPendingMembers([]);
            }
        } catch (e) {
            console.error('Failed to fetch members:', e);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [client, session, room.id, isAdmin]);

    useEffect(() => { fetchMembers(); }, [fetchMembers]);

    useEffect(() => {
        if (!socket) return;
        const prev = socket.onnotification;

        socket.onnotification = async (notification) => {

            fetchMembers(true);

            if (notification?.content?.group_id === roomRef.current.id &&
                notification?.code === -3) {
                setRoomDeleted(true);
            }
        };

        return () => { socket.onnotification = prev; };
    }, [socket, fetchMembers]);

    useEffect(() => {
        if (roomDeleted) onBack();
    }, [roomDeleted, onBack]);

    const handleApprove = async (groupId, userId) => {
        try {
            await client.addGroupUsers(session, groupId, [userId]);
            fetchMembers(true);
        } catch (e) {
            console.error('Failed to approve member:', e);
        }
    };

    const handleKick = async (groupId, userId) => {
        try {
            await client.kickGroupUsers(session, groupId, [userId]);
            fetchMembers(true);
        } catch (e) {
            console.error('Failed to kick member:', e);
        }
    };

    const handleLeave = async (groupId) => {
        try {
            await client.leaveGroup(session, groupId);
            onBack();
        } catch (e) {
            console.error('Failed to leave room:', e);
        }
    };

    const handleDelete = async (groupId) => {
        try {
            await client.deleteGroup(session, groupId);
            onBack();
        } catch (e) {
            console.error('Failed to delete room:', e);
        }
    };

    return (
        <MemberScreen
            loading={loading}
            myUserId={myUserId}
            selectedRoom={{ ...room, edge_count: edgeCount }}
            roomMembers={roomMembers}
            pendingMembers={pendingMembers}
            onBack={onBack}
            onApprove={handleApprove}
            onKick={handleKick}
            onLeave={handleLeave}
            onDelete={handleDelete}
            onStartRoomMatch={onRoomMatch}
        />
    );
}