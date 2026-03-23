import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import ShuffleOutlinedIcon from '@mui/icons-material/ShuffleOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import WifiOffOutlinedIcon from '@mui/icons-material/WifiOffOutlined';

export const HOME_SCREEN_MENU = [
    {
        group: 'play',
        items: [
            { key: 'timed', label: 'Timed Match', icon: TimerOutlinedIcon },
            { key: 'classic', label: 'Classic Match', icon: AppsOutlinedIcon },
        ],
    },
    {
        group: 'social',
        items: [
            { key: 'explore', label: 'Explore Rooms', icon: GroupsIcon },
            { key: 'ranks', label: 'Global Ranks', icon: EmojiEventsOutlinedIcon },
        ],
    },
    {
        group: 'settings',
        items: [
            { key: 'name-settings', label: 'Name Settings', icon: BadgeOutlinedIcon },
            { key: 'about', label: 'About Game', icon: InfoOutlinedIcon },
        ],
    }
];

export const ABOUT_SCREEN_MENU_1 = [
    {
        icon: SecurityOutlinedIcon,
        name: 'Server-Authoritative Logic',
        desc: 'All game state lives on the server. Every move is validated before being applied — no client-side manipulation or cheating possible.',
    },
    {
        icon: ShuffleOutlinedIcon,
        name: 'Smart Matchmaking',
        desc: 'Automatically pairs players by mode. Handles connections and disconnections gracefully with a reconnection grace period.',
    },
    {
        icon: BoltOutlinedIcon,
        name: 'Concurrent Sessions',
        desc: 'Multiple isolated game rooms run simultaneously. Each session is fully independent, keeping gameplay fair and scalable.',
    },
    {
        icon: EmojiEventsOutlinedIcon,
        name: 'Global Leaderboard',
        desc: 'Tracks wins, losses, and score across all players. Persistent rankings with full per-player statistics.',
    },
    {
        icon: CalculateOutlinedIcon,
        name: 'Score Calculation',
        desc: 'Every win earns 75 points. Every loss deducts 25. Draws don\'t count — no record, no penalty, no reward.',
    },
    {
        icon: TimerOutlinedIcon,
        name: 'Timed Mode',
        desc: '30 seconds per turn. Miss your window and the move is forfeited automatically. Choose between Classic or Timed wisely.',
    },
    {
        icon: WifiOffOutlinedIcon,
        name: 'Disconnect Tolerance',
        desc: 'If opponent loses connection, the game pauses and gives them 60 seconds to reconnect, otherwise the match only ends.',
    }
];

export const ABOUT_SCREEN_MENU_2 = [
    {
        key: 'Phone',
        val: '7029015143'
    },
    {
        key: 'Email',
        val: 'arghadipdas@icloud.com'
    },
    {
        key: 'Company',
        val: 'Dwarika Group of Companies'
    },
    {
        key: 'Designation',
        val: 'Software Engineer'
    },
    {
        key: 'Skills',
        val: 'MERN, LAMP, IoT, AI/ML, Cloud'
    },
    {
        key: 'Current City',
        val: 'Siliguri, WB, IN'
    },
    {
        key: 'Notice Period',
        val: '30 days'
    },
    {
        key: 'Last Working Day',
        val: '30th April, 2026'
    },
    {
        key: 'Tentative Start Date',
        val: '1st May, 2026'
    },
    {
        key: 'Relocation',
        val: 'Pan India'
    }
];