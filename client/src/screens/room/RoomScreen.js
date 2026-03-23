import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VerifiedIcon from '@mui/icons-material/Verified';
import PersonIcon from '@mui/icons-material/Person';
import PendingIcon from '@mui/icons-material/Pending';
import GroupsIcon from '@mui/icons-material/Groups';
import { Layout } from '../../components/layout';
import { RoundButton } from '../../components/button';
import { CapitalText, NormalText } from '../../components/text';
import { MenuInput } from '../../components/input';
import { MenuIcon } from '../../components/icon';
import './RoomScreen.css';

export default function RoomScreen({
    loading, myUserId, rooms, requestedRooms, selectedRoom, roomMembers, pendingMembers,
    onSelectRoom, onBack, onCreateRoom, onRequestJoin, onApprove, onKick, onLeave,
    onDelete, onStartRoomMatch, createError, joinError, clearErrors
}) {
    const [createOpen, setCreateOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);

    if (!selectedRoom) {
        return (
            <Layout title="Explore Rooms" onBack={onBack}>
                <div className="flex items-center justify-center flex-col gap-4 mb-6">
                    {loading
                        ? <CapitalText fill="-1">Loading your rooms</CapitalText>
                        : <CapitalText>Create or Request</CapitalText>
                    }
                    <div className="flex items-center justify-center gap-4">
                        <RoundButton icon={AddIcon} onClick={() => setCreateOpen(true)} />
                        <RoundButton icon={SearchIcon} onClick={() => setJoinOpen(true)} />
                    </div>
                </div>

                {!loading && rooms.length === 0 ? (
                    <div className="text-center mt-4 mb-6">
                        <CapitalText>You are not a member yet</CapitalText>
                    </div>
                ) : (
                    <div className="flex flex-col overflow-hidden card-theme mb-6">
                        {rooms.map((room, idx) => (
                            <div key={room.group.id} className="flex flex-col">
                                {idx > 0 && <div className="h-px room-screen-divider" />}
                                <div
                                    onClick={() => onSelectRoom(room.group)}
                                    className="flex items-center cursor-pointer card-theme-item room-screen-item room-screen-item--clickable"
                                >
                                    <MenuIcon icon={GroupsIcon} size="sm" />
                                    <div className="flex flex-col gap-1 flex-1 min-w-0 room-screen-item__body">
                                        <NormalText>{room.group.name}</NormalText>
                                        <CapitalText size="11">{room.group.edge_count}/100 Members</CapitalText>
                                    </div>
                                    <ChevronRightIcon className="shrink-0 text-white/20" style={{ fontSize: 18 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && requestedRooms?.length > 0 && (
                    <div className="flex flex-col overflow-hidden card-theme">
                        {requestedRooms.map((room, idx) => (
                            <div key={room.group.id} className="flex flex-col">
                                {idx > 0 && <div className="h-px room-screen-divider" />}
                                <div className="flex items-center card-theme-item room-screen-item opacity-50">
                                    <MenuIcon icon={GroupsIcon} size="sm" />
                                    <div className="flex flex-col gap-1 flex-1 min-w-0 room-screen-item__body">
                                        <NormalText>{room.group.name}</NormalText>
                                        <CapitalText size="11">Membership Requested</CapitalText>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <MenuInput
                    open={createOpen}
                    title="Create Room"
                    fields={[{ key: 'name', placeholder: 'Room Name' }]}
                    onSubmit={(v) => { onCreateRoom(v.name, () => setCreateOpen(false)); }}
                    onClose={() => { setCreateOpen(false); clearErrors(); }}
                    error={createError}
                />
                <MenuInput
                    open={joinOpen}
                    title="Join Room"
                    fields={[{ key: 'name', placeholder: 'Room Name' }]}
                    onSubmit={(v) => { onRequestJoin(v.name, () => setJoinOpen(false)); }}
                    onClose={() => { setJoinOpen(false); clearErrors(); }}
                    error={joinError}
                />
            </Layout>
        );
    }

    const isAdmin = selectedRoom.creator_id === myUserId;

    return (
        <Layout title={selectedRoom.name} onBack={() => onSelectRoom(null)}>
            <div className="flex items-center justify-center flex-col gap-4 mb-6">
                <CapitalText>{selectedRoom.edge_count} / 100 Players</CapitalText>
                <div className="flex items-center justify-center gap-4">
                    <RoundButton icon={PlayArrowIcon} onClick={() => onStartRoomMatch(selectedRoom.id)} />
                    {isAdmin ? (
                        <RoundButton icon={DeleteIcon} onClick={() => onDelete(selectedRoom.id)} danger />
                    ) : (
                        <RoundButton icon={LogoutIcon} onClick={() => onLeave(selectedRoom.id)} danger />
                    )}
                </div>
            </div>

            {roomMembers.length === 0 ? (
                <div className="text-center mt-4">
                    <CapitalText>No players are a member yet</CapitalText>
                </div>
            ) : (
                <div className="flex flex-col overflow-hidden card-theme mb-6">
                    {roomMembers.map((m, idx) => {
                        const isMe = m.user.id === myUserId;
                        const isRoomAdmin = m.user.id === selectedRoom.creator_id;
                        
                        return (
                            <div key={m.user.id} className="flex flex-col">
                                {idx > 0 && <div className="h-px room-screen-divider" />}
                                <div className={`flex items-center justify-between card-theme-item room-screen-item ${isMe ? 'room-screen-item--me' : ''}`}>
                                    <div className="flex items-center flex-1 min-w-0">
                                        {isRoomAdmin ? (
                                            <MenuIcon icon={VerifiedIcon} size="sm" />
                                        ) : (
                                            <MenuIcon icon={PersonIcon} size="sm" />
                                        )}
                                        <div className="flex flex-col gap-1 flex-1 min-w-0 room-screen-item__body">
                                            <NormalText className="truncate">
                                                {m.user.display_name || 'Anonymous'}
                                            </NormalText>
                                            <CapitalText size="11">{isRoomAdmin ? 'Admin' : 'Member'}</CapitalText>
                                        </div>
                                    </div>
                                    {isAdmin && !isMe && (
                                        <RoundButton icon={CloseIcon} onClick={() => onKick(selectedRoom.id, m.user.id)} danger />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isAdmin && pendingMembers.length > 0 && (
                <div className="mb-6">
                    <div className="flex flex-col overflow-hidden card-theme">
                        {pendingMembers.map((m, idx) => (
                            <div key={m.user.id} className="flex flex-col">
                                {idx > 0 && <div className="h-px room-screen-divider" />}
                                <div className="flex items-center justify-between card-theme-item room-screen-item">
                                    <div className="flex items-center flex-1 min-w-0">
                                        <MenuIcon icon={PendingIcon} size="sm" />
                                        <div className="flex flex-col gap-1 flex-1 min-w-0 room-screen-item__body">
                                            <NormalText className="truncate">
                                                {m.user.display_name || 'Anonymous'}
                                            </NormalText>
                                            <CapitalText size="11">Membership Requested</CapitalText>
                                        </div>
                                    </div>
                                    <RoundButton icon={CheckIcon} onClick={() => onApprove(selectedRoom.id, m.user.id)} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Layout>
    );
}