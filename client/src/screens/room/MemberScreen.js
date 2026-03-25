import TimerIcon from '@mui/icons-material/TimerTwoTone';
import AppsIcon from '@mui/icons-material/AppsTwoTone';
import LogoutIcon from '@mui/icons-material/LogoutTwoTone';
import DeleteIcon from '@mui/icons-material/DeleteTwoTone';
import CheckIcon from '@mui/icons-material/CheckTwoTone';
import CloseIcon from '@mui/icons-material/CloseTwoTone';
import PersonIcon from '@mui/icons-material/PersonTwoTone';
import PendingIcon from '@mui/icons-material/PendingTwoTone';
import { Layout } from '../../components/layout';
import { RoundButton } from '../../components/button';
import { CapitalText, NormalText } from '../../components/text';
import { MenuIcon } from '../../components/icon';
import './MemberScreen.css';

export default function MemberScreen({
    loading, myUserId, selectedRoom, roomMembers, pendingMembers,
    onBack, onApprove, onKick, onLeave, onDelete, onStartRoomMatch
}) {
    const isAdmin = selectedRoom.creator_id === myUserId;

    return (
        <Layout title={selectedRoom.name} onBack={onBack}>
            <div className="flex items-center justify-center flex-col gap-4 mb-6">
                <CapitalText fill={loading ? '-1' : undefined}>
                    {loading ? 'Loading room members' : `${selectedRoom.edge_count} / 100 Players`}
                </CapitalText>
                <div className="flex items-center justify-center gap-4">
                    <RoundButton
                        icon={TimerIcon}
                        onClick={() => onStartRoomMatch('timed', selectedRoom.id)}
                    />
                    <RoundButton
                        icon={AppsIcon}
                        onClick={() => onStartRoomMatch('classic', selectedRoom.id)}
                    />
                    {isAdmin ? (
                        <RoundButton icon={DeleteIcon} onClick={() => onDelete(selectedRoom.id)} danger />
                    ) : (
                        <RoundButton icon={LogoutIcon} onClick={() => onLeave(selectedRoom.id)} danger />
                    )}
                </div>
            </div>

            {roomMembers.length > 0 && (
                <div className="flex flex-col overflow-hidden card-theme divide-y divide-white/[.04] mb-6">
                    {roomMembers.map((m) => {
                        const isMe = m.user.id === myUserId;
                        const isRoomAdmin = m.user.id === selectedRoom.creator_id;

                        return (
                            <div
                                key={m.user.id}
                                className={`flex items-center justify-between card-theme-item member-screen-item ${isMe ? 'member-screen-item--me' : ''}`}
                            >
                                <div className="flex items-center flex-1 min-w-0">
                                    <MenuIcon icon={PersonIcon} />
                                    <div className="flex flex-col gap-1 flex-1 min-w-0 ml-4">
                                        <NormalText className="truncate">
                                            {m.user.display_name || 'Anonymous'}
                                        </NormalText>
                                        <CapitalText size="11">
                                            {isRoomAdmin ? 'Admin' : 'Member'}
                                        </CapitalText>
                                    </div>
                                </div>
                                {isAdmin && !isMe && (
                                    <RoundButton
                                        icon={CloseIcon}
                                        onClick={() => onKick(selectedRoom.id, m.user.id)}
                                        danger
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {isAdmin && pendingMembers.length > 0 && (
                <div className="flex flex-col overflow-hidden card-theme divide-y divide-white/[.04] mb-6">
                    {pendingMembers.map((m) => (
                        <div
                            key={m.user.id}
                            className="flex items-center justify-between card-theme-item member-screen-item"
                        >
                            <div className="flex items-center flex-1 min-w-0">
                                <MenuIcon icon={PendingIcon} />
                                <div className="flex flex-col gap-1 flex-1 min-w-0 ml-4">
                                    <NormalText className="truncate">
                                        {m.user.display_name || 'Anonymous'}
                                    </NormalText>
                                    <CapitalText size="11">Membership Requested</CapitalText>
                                </div>
                            </div>
                            <RoundButton
                                icon={CheckIcon}
                                onClick={() => onApprove(selectedRoom.id, m.user.id)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}