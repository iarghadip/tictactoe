import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';
import { Layout } from '../../components/layout';
import { Score } from '../../components/score';
import { CapitalText, NormalText } from '../../components/text';
import './LeaderboardScreen.css';

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

function PlayerRow({ player, isMe }) {
    const isTop = player.rank <= 3;
    return (
        <div className={`lb-row ${isMe ? 'lb-row--me' : ''}`}>
            <div className={`lb-row__rank ${isTop ? 'lb-row__rank--top' : ''}`}>
                {isTop ? (
                    <MilitaryTechOutlinedIcon
                        style={{ fontSize: 22, color: MEDAL_COLORS[player.rank - 1] }}
                    />
                ) : `#${player.rank}` }
            </div>
            <div className="lb-row__info">
                <NormalText>{player.display_name}</NormalText>
                <CapitalText size="11">{player.matches}P · {player.wins}W · {player.losses}L</CapitalText>
            </div>
            <NormalText className="lb-row__score">{player.score.toLocaleString()}</NormalText>
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
                    <div className="lb-list">
                        {top100.map(player => (
                            <PlayerRow
                                key={player.id}
                                player={player}
                                isMe={player.id === myUserId}
                            />
                        ))}
                    </div>
                )}
        </Layout>
    );
}