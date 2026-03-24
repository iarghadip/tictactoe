import Timer from '@mui/icons-material/Timer';
import Apps from '@mui/icons-material/Apps';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import Badge from '@mui/icons-material/Badge';
import Info from '@mui/icons-material/Info';
import Security from '@mui/icons-material/Security';
import Shuffle from '@mui/icons-material/Shuffle';
import Bolt from '@mui/icons-material/Bolt';
import Calculate from '@mui/icons-material/Calculate';
import WifiOff from '@mui/icons-material/WifiOff';

export const HOME_SCREEN_MENU = [
    {
        items: [
            { label: 'Timed Match', icon: Timer },
            { label: 'Classic Match', icon: Apps },
        ],
    },
    {
        items: [
            { label: 'Explore Rooms', icon: GroupsIcon },
            { label: 'Global Ranks', icon: EmojiEvents },
        ],
    },
    {
        items: [
            { label: 'Player Settings', icon: Badge },
            { label: 'About Game', icon: Info },
        ],
    }
];

export const ABOUT_SCREEN_MENU_1 = [
    {
        icon: Security,
        name: 'Server-Authoritative Logic',
        desc: 'All game state lives on the server. Every move is validated before being applied — no client-side manipulation or cheating possible.',
    },
    {
        icon: Shuffle,
        name: 'Smart Matchmaking',
        desc: 'Automatically pairs players by mode. Handles connections and disconnections gracefully with a reconnection grace period.',
    },
    {
        icon: Bolt,
        name: 'Concurrent Sessions',
        desc: 'Multiple isolated game rooms run simultaneously. Each session is fully independent, keeping gameplay fair and scalable.',
    },
    {
        icon: EmojiEvents,
        name: 'Global Leaderboard',
        desc: 'Tracks wins, losses, and score across all players. Persistent rankings with full per-player statistics.',
    },
    {
        icon: Calculate,
        name: 'Score Calculation',
        desc: 'Every win earns 75 points. Every loss deducts 25. Draws don\'t count — no record, no penalty, no reward.',
    },
    {
        icon: Timer,
        name: 'Timed Mode',
        desc: '30 seconds per turn. Miss your window and the move is forfeited automatically. Choose between Classic or Timed wisely.',
    },
    {
        icon: WifiOff,
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