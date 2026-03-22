import { CapitalText, NormalText } from '../../components/text';
import './Score.css';

function StatPill({ label, value }) {
    return (
        <div className="score-stat-pill">
            <NormalText size="2">{value}</NormalText>
            <CapitalText size="10">{label}</CapitalText>
        </div>
    );
}

export default function Score({ stats, loading = false }) {
    if (!stats) {
        return (
            <div className="score-stats score-stats--empty">
                {loading ? (
                    <CapitalText fill="-1">Loading your stats</CapitalText>
                ) : (
                    <CapitalText>You are not ranked yet</CapitalText>
                )}
            </div>
        );
    }
    return (
        <div className="score-stats">
            <div className="score-stats__top">
                <NormalText size="1">#{stats.rank}</NormalText>
                <NormalText size="2" className="score-stats__score">{stats.score.toLocaleString()} pts</NormalText>
            </div>
            <CapitalText>{stats.display_name}</CapitalText>
            <div className="score-stats__stats">
                <StatPill label="played" value={stats.matches} />
                <StatPill label="won" value={stats.wins} />
                <StatPill label="lost" value={stats.losses} />
            </div>
        </div>
    );
}