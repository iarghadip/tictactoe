import TimerIcon from '@mui/icons-material/TimerTwoTone';
import AppsIcon from '@mui/icons-material/AppsTwoTone';
import GroupsIcon from '@mui/icons-material/GroupsTwoTone';
import EmojiEventsIcon from '@mui/icons-material/EmojiEventsTwoTone';
import SettingsIcon from '@mui/icons-material/SettingsTwoTone';
import InfoIcon from '@mui/icons-material/InfoTwoTone';
import SecurityIcon from '@mui/icons-material/SecurityTwoTone';
import ShuffleIcon from '@mui/icons-material/ShuffleTwoTone';
import BoltIcon from '@mui/icons-material/BoltTwoTone';
import CalculateIcon from '@mui/icons-material/CalculateTwoTone';
import WifiOffIcon from '@mui/icons-material/WifiOffTwoTone';

export const HOME_SCREEN_MENU = [
    {
        items: [
            { label: 'Timed Match', icon: TimerIcon },
            { label: 'Classic Match', icon: AppsIcon },
        ],
    },
    {
        items: [
            { label: 'Explore Rooms', icon: GroupsIcon },
            { label: 'Global Ranks', icon: EmojiEventsIcon },
        ],
    },
    {
        items: [
            { label: 'Player Settings', icon: SettingsIcon },
            { label: 'About Game', icon: InfoIcon },
        ],
    }
];

export const ABOUT_SCREEN_MENU_1 = [
    {
        icon: SecurityIcon,
        name: 'Server-Authoritative Logic',
        desc: 'All game state lives on the server. Every move is validated before being applied — no client-side manipulation or cheating possible.',
    },
    {
        icon: ShuffleIcon,
        name: 'Smart Matchmaking',
        desc: 'Automatically pairs players by mode. Handles connections and disconnections gracefully with a reconnection grace period.',
    },
    {
        icon: BoltIcon,
        name: 'Concurrent Sessions',
        desc: 'Multiple isolated game rooms run simultaneously. Each session is fully independent, keeping gameplay fair and scalable.',
    },
    {
        icon: EmojiEventsIcon,
        name: 'Global Leaderboard',
        desc: 'Tracks wins, losses, and score across all players. Persistent rankings with full per-player statistics.',
    },
    {
        icon: CalculateIcon,
        name: 'Score Calculation',
        desc: 'Every win earns 75 points. Every loss deducts 25. Draws don\'t count — no record, no penalty, no reward.',
    },
    {
        icon: TimerIcon,
        name: 'Timed Mode',
        desc: '30 seconds per turn. Miss your window and the move is forfeited automatically. Choose between Classic or Timed wisely.',
    },
    {
        icon: WifiOffIcon,
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