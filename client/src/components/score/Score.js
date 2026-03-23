import { CapitalText, NormalText } from '../../components/text';
import './Score.css';

function StatPill({ label, value }) {
    return (
        <div className="flex flex-col items-center flex-1 px-4 py-2 score-stat-pill">
            <NormalText size="2">{value}</NormalText>
            <CapitalText size="10">{label}</CapitalText>
        </div>
    );
}

export default function Score({ stats, loading = false }) {
    if (!stats) {
        return (
            <div className="flex items-center justify-center p-6 score-stats">
                {loading
                    ? <CapitalText fill="-1">Loading your stats</CapitalText>
                    : <CapitalText>You are not ranked yet</CapitalText>
                }
            </div>
        );
    }

    return (
        <div className="flex flex-col px-6 py-5 score-stats">
            <div className="flex items-baseline justify-between score-stats__top">
                <NormalText size="1">#{stats.rank}</NormalText>
                <NormalText size="2" className="score-stats__score">{stats.score.toLocaleString()} pts</NormalText>
            </div>
            <CapitalText>{stats.display_name}</CapitalText>
            <div className="flex gap-3">
                <StatPill label="played" value={stats.matches} />
                <StatPill label="won" value={stats.wins} />
                <StatPill label="lost" value={stats.losses} />
            </div>
        </div>
    );
}