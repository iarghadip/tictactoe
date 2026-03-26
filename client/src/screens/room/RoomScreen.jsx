import AddIcon from '@mui/icons-material/AddTwoTone';
import SearchIcon from '@mui/icons-material/SearchTwoTone';
import ChevronRightIcon from '@mui/icons-material/ChevronRightTwoTone';
import GroupsIcon from '@mui/icons-material/GroupsTwoTone';
import { Layout } from '../../components/layout';
import { RoundButton } from '../../components/button';
import { CapitalText, NormalText } from '../../components/text';
import { MenuIcon } from '../../components/icon';
import './RoomScreen.css';

export default function RoomScreen({
    loading, rooms, requestedRooms, onSelectRoom,
    onBack, onOpenCreate, onOpenJoin
}) {
    const totalRooms = (rooms?.length || 0) + (requestedRooms?.length || 0);
    const isAtLimit = totalRooms >= 25;

    return (
        <Layout title="Explore Rooms" onBack={onBack}>
            <div className="flex items-center justify-center flex-col gap-4 mb-6">
                <CapitalText fill={loading ? '-1' : undefined}>
                    {loading ? 'Loading your rooms' : (rooms.length === 0 ? 'You have no rooms' : `${totalRooms}/25 Rooms`)}
                </CapitalText>
                <div className={`flex items-center justify-center gap-4 ${isAtLimit ? 'opacity-50' : ''}`}>
                    <RoundButton 
                        icon={AddIcon} 
                        disabled={isAtLimit}
                        onClick={() => { if (!isAtLimit) onOpenCreate(); }} 
                    />
                    <RoundButton 
                        icon={SearchIcon} 
                        disabled={isAtLimit}
                        onClick={() => { if (!isAtLimit) onOpenJoin(); }} 
                    />
                </div>
            </div>

            {rooms.length > 0 && (
                <div className="flex flex-col overflow-hidden card-theme divide-y divide-white/[.04] mb-6">
                    {rooms.map((room) => (
                        <div
                            key={room.group.id}
                            onClick={() => onSelectRoom(room.group)}
                            className="flex items-center cursor-pointer card-theme-item room-screen-item room-screen-item--clickable"
                        >
                            <MenuIcon icon={GroupsIcon} />
                            <div className="flex flex-col gap-1 flex-1 min-w-0 ml-4">
                                <NormalText>{room.group.name}</NormalText>
                                <CapitalText size="11">{room.group.edge_count}/100 Members</CapitalText>
                            </div>
                            <ChevronRightIcon className="shrink-0 text-white/20" style={{ fontSize: 18 }} />
                        </div>
                    ))}
                </div>
            )}

            {!loading && requestedRooms?.length > 0 && (
                <div className="flex flex-col overflow-hidden card-theme divide-y divide-white/[.04]">
                    {requestedRooms.map((room) => (
                        <div
                            key={room.group.id}
                            className="flex items-center card-theme-item room-screen-item opacity-50"
                        >
                            <MenuIcon icon={GroupsIcon} />
                            <div className="flex flex-col gap-1 flex-1 min-w-0 ml-4">
                                <NormalText>{room.group.name}</NormalText>
                                <CapitalText size="11">Membership Requested</CapitalText>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}