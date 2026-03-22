import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import './HomeScreen.css';

const MENU = [
    {
        group: 'play',
        items: [
            { key: 'timed', label: 'Timed Match', icon: <TimerOutlinedIcon fontSize="small" /> },
            { key: 'classic', label: 'Classic Match', icon: <AppsOutlinedIcon fontSize="small" /> },
        ],
    },
    {
        group: 'social',
        items: [
            { key: 'explore', label: 'Explore Rooms', icon: <ExploreOutlinedIcon fontSize="small" /> },
            { key: 'ranks', label: 'Global Ranks', icon: <EmojiEventsOutlinedIcon fontSize="small" /> },
        ],
    },
    {
        group: 'settings',
        items: [
            { key: 'name-settings', label: 'Name Settings', icon: <BadgeOutlinedIcon fontSize="small" /> },
            { key: 'about', label: 'About Game', icon: <InfoOutlinedIcon fontSize="small" /> },
        ],
    },
];

export default function HomeScreen({
    displayName,
    isLoggedIn,
    onTimedMatch,
    onClassicMatch,
    onExploreRooms,
    onGlobalRanks,
    onNameSettings,
    onAbout,
    onLogout,
}) {
    const handlers = {
        timed: onTimedMatch,
        classic: onClassicMatch,
        explore: onExploreRooms,
        ranks: onGlobalRanks,
        'name-settings': onNameSettings,
        about: onAbout,
    };

    return (
        <div className="home-screen">
            <div className="home-container">
                <div className="home-header">
                    <div className="home-header__title">Tic Tac Toe</div>
                    {isLoggedIn && (
                        <div className="home-header__name">{displayName}</div>
                    )}
                </div>
                <div className="home-menu">
                    {MENU.map((group, gi) => (
                        <div key={group.group} className="home-menu__group">
                            {gi > 0 && <div className="home-menu__divider" />}
                            {group.items.map(item => (
                                <div
                                    key={item.key}
                                    className="home-menu__item"
                                    onClick={handlers[item.key]}
                                >
                                    <span className="home-menu__icon">{item.icon}</span>
                                    <span className="home-menu__label">{item.label}</span>
                                    <ChevronRightIcon className="home-menu__arrow" style={{ fontSize: 18 }} />
                                </div>
                            ))}
                        </div>
                    ))}
                    {isLoggedIn && (
                        <>
                            <div className="home-menu__divider" />
                            <div
                                className="home-menu__item home-menu__item--danger"
                                onClick={onLogout}
                            >
                                <span className="home-menu__icon home-menu__icon--danger">
                                    <LogoutOutlinedIcon fontSize="small" />
                                </span>
                                <span className="home-menu__label home-menu__label--danger">Logout Player</span>
                                <ChevronRightIcon className="home-menu__arrow" style={{ fontSize: 18 }} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}