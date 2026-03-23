import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';
import { Confetti } from '../../components/confetti';
import { Layout } from '../../components/layout';
import { Score } from '../../components/score';
import { CapitalText, NormalText } from '../../components/text';
import './LeaderboardScreen.css';

function PlayerRow({ player, isMe }) {
    const isTop = player.rank <= 3;

    return (
        <div className={`flex items-center leaderboard-row ${isMe ? 'leaderboard-row--me' : ''}`}>
            <Confetti isWinner={isMe} />
            <div
                className={`
                    flex items-center justify-center shrink-0 text-center
                    leaderboard-row__rank
                    ${isTop ? 'leaderboard-row__rank--top' : ''}
                `}
            >
                {isTop
                    ? <MilitaryTechOutlinedIcon style={{ fontSize: 22, color: ['#FFD700', '#C0C0C0', '#CD7F32'][player.rank - 1] }} />
                    : `#${player.rank}`
                }
            </div>
            <div className="flex flex-col flex-1 min-w-0 leaderboard-row__info">
                <NormalText>{player.display_name}</NormalText>
                <CapitalText size="11">{player.matches}P · {player.wins}W · {player.losses}L</CapitalText>
            </div>
            <NormalText className="shrink-0 leaderboard-row__score">
                {player.score.toLocaleString()}
            </NormalText>
        </div>
    );
}

export default function LeaderboardScreen({ loading, top100, myStats, myUserId, onBack }) {
    return (
        <Layout title="Global Ranks" onBack={onBack}>
            <Score stats={myStats} loading={loading} />
            {top100.length === 0 ? (
                <CapitalText>No players ranked yet</CapitalText>
            ) : (
                <div className="flex flex-col overflow-hidden leaderboard-list">
                    {top100.map(player => (
                        <PlayerRow key={player.id} player={player} isMe={player.id === myUserId} />
                    ))}
                </div>
            )}
        </Layout>
    );
}