import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import ShuffleOutlinedIcon from '@mui/icons-material/ShuffleOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import WifiOffOutlinedIcon from '@mui/icons-material/WifiOffOutlined';
import { Layout } from '../../components/layout';
import './AboutScreen.css';

const FEATURES = [
    {
        icon: <SecurityOutlinedIcon fontSize="small" />,
        iconClass: 'about-feature__icon--teal',
        name: 'Server-Authoritative Logic',
        desc: 'All game state lives on the server. Every move is validated before being applied — no client-side manipulation or cheating possible.',
    },
    {
        icon: <ShuffleOutlinedIcon fontSize="small" />,
        iconClass: 'about-feature__icon--purple',
        name: 'Smart Matchmaking',
        desc: 'Automatically pairs players by mode. Handles connections and disconnections gracefully with a reconnection grace period.',
    },
    {
        icon: <BoltOutlinedIcon fontSize="small" />,
        iconClass: 'about-feature__icon--amber',
        name: 'Concurrent Sessions',
        desc: 'Multiple isolated game rooms run simultaneously. Each session is fully independent, keeping gameplay fair and scalable.',
    },
    {
        icon: <EmojiEventsOutlinedIcon fontSize="small" />,
        iconClass: 'about-feature__icon--red',
        name: 'Global Leaderboard',
        desc: 'Tracks wins, losses, and score across all players. Persistent rankings with full per-player statistics.',
    },
    {
        icon: <CalculateOutlinedIcon fontSize="small" />,
        iconClass: 'about-feature__icon--teal',
        name: 'Score Calculation',
        desc: 'Every win earns 100 points. Every loss deducts 25. Draws don\'t count — no record, no penalty, no reward.',
    },
    {
        icon: <TimerOutlinedIcon fontSize="small" />,
        iconClass: 'about-feature__icon--blue',
        name: 'Timed Mode',
        desc: '30 seconds per turn. Miss your window and the move is forfeited automatically. Choose between Classic or Timed wisely.',
    },
    {
        icon: <WifiOffOutlinedIcon fontSize="small" />,
        iconClass: 'about-feature__icon--purple',
        name: 'Disconnect Tolerance',
        desc: 'If opponent loses connection, the game pauses and gives them 60 seconds to reconnect, otherwise the match only ends.',
    },
];

const DEV_ROWS = [
    { key: 'Phone', val: '7029015143' },
    { key: 'Email', val: 'arghadipdas@icloud.com' },
    { key: 'Company', val: 'Dwarika Group of Companies' },
    { key: 'Designation', val: 'Software Engineer' },
    { key: 'Skills', val: 'MERN, LAMP, IoT, AI/ML, Cloud' },
    { key: 'Current City', val: 'Siliguri, WB, IN' },
    { key: 'Notice Period', val: '30 days' },
    { key: 'Last Working Day', val: '30th April, 2026' },
    { key: 'Tentative Start Date', val: '1st May, 2026' },
    { key: 'Relocation', val: 'Pan India' },
];

export default function AboutScreen({ onBack }) {
    return (
        <Layout title="About Game" onBack={onBack}>
            <div className="about-features">
                {FEATURES.map(feature => (
                    <div className="about-feature" key={feature.name}>
                        <div className={`about-feature__icon ${feature.iconClass}`}>
                            {feature.icon}
                        </div>
                        <div className="about-feature__body">
                            <div className="about-feature__name">{feature.name}</div>
                            <div className="about-feature__desc">{feature.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="about-dev">
                <div className="about-dev__top">
                    <div className="about-dev__name">Arghadip Das</div>
                </div>
                <div className="about-dev__rows">
                    {DEV_ROWS.map(row => (
                        <div className="about-dev__row" key={row.key}>
                            <div className="about-dev__key">{row.key}</div>
                            <div className="about-dev__val">{row.val}</div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}