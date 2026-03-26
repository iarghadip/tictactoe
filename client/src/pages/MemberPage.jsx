import { useEffect, useState, useCallback, useRef } from 'react';
import { useNakama } from '../contexts/nakamaContext';
import { MemberScreen } from '../screens/member';
import { MenuInput } from '../components/input';

export default function MemberPage({ room, onBack, onRoomMatch }) {
    const { client, session, account, socket } = useNakama();
    const [loading, setLoading] = useState(true);
    const [roomMembers, setRoomMembers] = useState([]);
    const [pendingMembers, setPendingMembers] = useState([]);
    const [edgeCount, setEdgeCount] = useState(room.edge_count);
    const [roomName, setRoomName] = useState(room.name);
    const [renameLoading, setRenameLoading] = useState(false);
    const [renameError, setRenameError] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [pendingIds, setPendingIds] = useState(new Set());

    const myUserId = account?.user?.id;
    const isAdmin = room.creator_id === myUserId;
    const channelIdRef = useRef(null);

    const fetchMembers = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [activeResult, pendingResult] = await Promise.all([
                client.listGroupUsers(session, room.id, undefined, 100),
                isAdmin ? client.listGroupUsers(session, room.id, 3, 100) : Promise.resolve({ group_users: [] })
            ]);
            const active = activeResult.group_users?.filter(u => u.state <= 2) || [];
            const pending = pendingResult.group_users || [];
            setRoomMembers(active);
            setEdgeCount(active.length);
            setPendingMembers(pending);
        } catch (e) {
            console.error('Failed to fetch members:', e);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [client, session, room.id, isAdmin]);

    useEffect(() => { fetchMembers(); }, [fetchMembers]);

    useEffect(() => {
        if (!socket) return;
        let alive = true;

        const setup = async () => {
            try {
                const channel = await socket.joinChat(room.id, 3, false, false);
                if (!alive) { socket.leaveChat(channel.id).catch(() => {}); return; }
                channelIdRef.current = channel.id;
            } catch (e) {
                console.error('Failed to join group channel:', e);
            }
        };

        setup();

        const prevMessage  = socket.onchannelmessage;
        const prevPresence = socket.onchannelpresence;

        socket.onchannelmessage  = () => fetchMembers(true);
        socket.onchannelpresence = () => fetchMembers(true);

        return () => {
            alive = false;
            socket.onchannelmessage  = prevMessage;
            socket.onchannelpresence = prevPresence;
            if (channelIdRef.current) {
                socket.leaveChat(channelIdRef.current).catch(() => {});
                channelIdRef.current = null;
            }
        };
    }, [socket, room.id, fetchMembers]);

    useEffect(() => {
        if (!socket) return;
        const prev = socket.onnotification;

        socket.onnotification = (notification) => {
            if (notification?.content?.group_id === room.id && notification?.code === -3) {
                onBack();
            } else {
                fetchMembers(true);
            }
        };

        return () => { socket.onnotification = prev; };
    }, [socket, room.id, fetchMembers, onBack]);

    const broadcastRefresh = useCallback(() => {
        if (!channelIdRef.current || !socket) return;
        socket.writeChatMessage(
            channelIdRef.current,
            JSON.stringify({ type: 'refresh' })
        ).catch(() => {});
    }, [socket]);

    const addPending = useCallback((id) => {
        setPendingIds(prev => new Set([...prev, id]));
    }, []);

    const removePending = useCallback((id) => {
        setPendingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }, []);
    
    const handleApprove = useCallback(async (groupId, userId) => {
        addPending(userId);
        try {
            await client.addGroupUsers(session, groupId, [userId]);
            broadcastRefresh();
            fetchMembers(true);
        } catch (e) {
            console.error('Failed to approve member:', e);
        } finally {
            removePending(userId);
        }
    }, [client, session, broadcastRefresh, fetchMembers, addPending, removePending]);

    const handleKick = useCallback(async (groupId, userId) => {
        addPending(userId);
        try {
            await client.kickGroupUsers(session, groupId, [userId]);
            broadcastRefresh();
            fetchMembers(true);
        } catch (e) {
            console.error('Failed to kick member:', e);
        } finally {
            removePending(userId);
        }
    }, [client, session, broadcastRefresh, fetchMembers, addPending, removePending]);

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
            broadcastRefresh();
            await client.deleteGroup(session, groupId);
            onBack();
        } catch (e) {
            console.error('Failed to delete room:', e);
        }
    };

    const handleRename = async ({ name }) => {
        setRenameLoading(true);
        setRenameError(null);
        try {
            await client.updateGroup(session, room.id, { name: name.trim() });
            setRoomName(name.trim());
            broadcastRefresh();
            fetchMembers(true);
            setEditOpen(false);
        } catch (e) {
            console.error('Failed to rename room:', e);
            setRenameError(e.message || 'Room name already taken!');
        } finally {
            setRenameLoading(false);
        }
    };

    const handleEditClose = () => {
        setEditOpen(false);
        setRenameError(null);
    };

    return (
        <>
            <MemberScreen
                loading={loading}
                myUserId={myUserId}
                selectedRoom={{ ...room, edge_count: edgeCount, name: roomName }}
                roomMembers={roomMembers}
                pendingMembers={pendingMembers}
                pendingIds={pendingIds}
                onBack={onBack}
                onApprove={handleApprove}
                onKick={handleKick}
                onLeave={handleLeave}
                onDelete={handleDelete}
                onStartRoomMatch={onRoomMatch}
                onEditOpen={() => setEditOpen(true)}
            />
            {isAdmin && (
                <MenuInput
                    open={editOpen}
                    title="Rename Room"
                    fields={[{ key: 'name', placeholder: 'New Room Name' }]}
                    initialValues={{ name: roomName }}
                    onSubmit={handleRename}
                    onClose={handleEditClose}
                    loading={renameLoading}
                    error={renameError}
                />
            )}
        </>
    );
}