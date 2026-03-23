import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Layout } from '../../components/layout';
import { RoundButton } from '../../components/button';
import { CapitalText, NormalText } from '../../components/text';
import { MenuIcon } from '../../components/icon';
import { MenuInput } from '../../components/input';
import './RoomScreen.css';

export default function RoomScreen({
    myUserId, rooms, requestedRooms, selectedRoom, roomMembers, pendingMembers,
    onSelectRoom, onBack, onCreateRoom, onRequestJoin, onApprove, onKick, onLeave,
    onDelete, onStartRoomMatch, createError, joinError, clearErrors
}) {
    const [createOpen, setCreateOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);

    if (!selectedRoom) {
        return (
            <Layout title="Explore Rooms" onBack={onBack}>
                <div className="flex gap-4 justify-center mb-6">
                    <RoundButton icon={AddIcon} onClick={() => setCreateOpen(true)} />
                    <RoundButton icon={SearchIcon} onClick={() => setJoinOpen(true)} />
                </div>

                {rooms.length === 0 ? (
                    <div className="text-center mt-4 mb-6">
                        <CapitalText>You are not in any rooms yet</CapitalText>
                    </div>
                ) : (
                    <div className="flex flex-col overflow-hidden card-theme mb-6">
                        {rooms.map((room, idx) => (
                            <div key={room.group.id} className="flex flex-col">
                                {idx > 0 && <div className="h-px room-screen-divider" />}
                                <div
                                    onClick={() => onSelectRoom(room.group)}
                                    className="flex items-center cursor-pointer room-screen-item"
                                >
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <NormalText>{room.group.name}</NormalText>
                                        <CapitalText size="11">{room.group.edge_count}/100 Members</CapitalText>
                                    </div>
                                    <ChevronRightIcon className="shrink-0 text-white/20" style={{ fontSize: 18 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {requestedRooms?.length > 0 && (
                    <>
                        <CapitalText className="mb-3 px-2">Requested</CapitalText>
                        <div className="flex flex-col overflow-hidden card-theme">
                            {requestedRooms.map((room, idx) => (
                                <div key={room.group.id} className="flex flex-col">
                                    {idx > 0 && <div className="h-px room-screen-divider" />}
                                    <div className="flex items-center room-screen-item opacity-50">
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <NormalText>{room.group.name}</NormalText>
                                            <CapitalText size="11">Waiting for approval</CapitalText>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
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
            <div className="flex flex-col items-center gap-4 card-theme room-screen-header mb-6">
                <CapitalText>{selectedRoom.edge_count} / 100 Players</CapitalText>
                <div className="flex gap-4">
                    <RoundButton icon={PlayArrowIcon} onClick={() => onStartRoomMatch(selectedRoom.id)} />
                    {isAdmin ? (
                        <RoundButton icon={DeleteIcon} onClick={() => onDelete(selectedRoom.id)} />
                    ) : (
                        <RoundButton icon={LogoutIcon} onClick={() => onLeave(selectedRoom.id)} />
                    )}
                </div>
            </div>

            {isAdmin && pendingMembers.length > 0 && (
                <div className="mb-6">
                    <CapitalText className="mb-3 px-2">Pending Requests</CapitalText>
                    <div className="flex flex-col overflow-hidden card-theme">
                        {pendingMembers.map((m, idx) => (
                            <div key={m.user.id} className="flex flex-col">
                                {idx > 0 && <div className="h-px room-screen-divider" />}
                                <div className="flex items-center justify-between room-screen-item">
                                    <NormalText className="flex-1 truncate">{m.user.display_name}</NormalText>
                                    <div 
                                        className="cursor-pointer" 
                                        onClick={() => onApprove(selectedRoom.id, m.user.id)}
                                    >
                                        <MenuIcon icon={<CheckIcon fontSize="small"/>} color="success" size="sm" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {roomMembers.length === 0 ? (
                <div className="text-center mt-4">
                    <CapitalText>No players are in this room</CapitalText>
                </div>
            ) : (
                <div className="flex flex-col overflow-hidden card-theme">
                    {roomMembers.map((m, idx) => (
                        <div key={m.user.id} className="flex flex-col">
                            {idx > 0 && <div className="h-px room-screen-divider" />}
                            <div className={`flex items-center justify-between room-screen-item ${isAdmin && m.user.id !== myUserId ? 'room-screen-item--danger cursor-pointer' : ''}`}
                                onClick={() => isAdmin && m.user.id !== myUserId && onKick(selectedRoom.id, m.user.id)}>
                                <NormalText className="flex-1 truncate">
                                    {m.user.display_name} {m.user.id === selectedRoom.creator_id ? '(Admin)' : ''}
                                </NormalText>
                                {isAdmin && m.user.id !== myUserId && (
                                    <MenuIcon icon={<CloseIcon fontSize="small"/>} color="danger" size="sm" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}