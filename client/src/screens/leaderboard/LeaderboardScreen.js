import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { RoundButton } from '../../components/button';
import './LeaderboardScreen.css';

function StatPill({ label, value }) {
    return (
        <div className="stat-pill">
            <span className="stat-pill__value">{value}</span>
            <span className="stat-pill__label">{label}</span>
        </div>
    );
}

function MyCard({ stats }) {
    if (!stats) {
        return (
            <div className="lb-my-card lb-my-card--empty">
                <div className="lb-my-card__no-games">Play a match to appear on the leaderboard</div>
            </div>
        );
    }

    return (
        <div className="lb-my-card">
            <div className="lb-my-card__top">
                <div className="lb-my-card__rank">#{stats.rank}</div>
                <div className="lb-my-card__score">{stats.score.toLocaleString()} pts</div>
            </div>
            <div className="lb-my-card__name">{stats.display_name}</div>
            <div className="lb-my-card__stats">
                <StatPill label="played" value={stats.matches} />
                <StatPill label="won" value={stats.wins} />
                <StatPill label="lost" value={stats.losses} />
            </div>
        </div>
    );
}

function PlayerRow({ player, isMe }) {
    return (
        <div className={`lb-row ${isMe ? 'lb-row--me' : ''}`}>
            <div className={`lb-row__rank ${player.rank <= 3 ? 'lb-row__rank--top' : ''}`}>
                {player.rank <= 3
                    ? ['🥇', '🥈', '🥉'][player.rank - 1]
                    : `#${player.rank}`
                }
            </div>
            <div className="lb-row__info">
                <div className="lb-row__name">{player.display_name}</div>
                <div className="lb-row__sub">{player.matches}P · {player.wins}W · {player.losses}L</div>
            </div>
            <div className="lb-row__score">{player.score.toLocaleString()}</div>
        </div>
    );
}

export default function LeaderboardScreen({ loading, top100, myStats, myUserId, onBack }) {
    return (
        <div className="lb-screen">
            <div className="lb-container">
                <div className="lb-header">
                    <RoundButton onClick={onBack}>
                        <ArrowBackIcon style={{ fontSize: 20 }} />
                    </RoundButton>
                    <div className="lb-header__title">Global Ranks</div>
                </div>

                {loading
                    ? (
                        <div className="lb-loading">Loading...</div>
                    )
                    : (
                        <>
                            <MyCard stats={myStats} />
                            {top100.length === 0
                                ? (
                                    <div className="lb-empty">No players ranked yet.</div>
                                )
                                : (
                                    <div className="lb-list">
                                        {top100.map(player => (
                                            <PlayerRow
                                                key={player.id}
                                                player={player}
                                                isMe={player.id === myUserId}
                                            />
                                        ))}
                                    </div>
                                )
                            }
                        </>
                    )
                }
            </div>
        </div>
    );
}