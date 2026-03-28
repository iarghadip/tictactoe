import MilitaryTechIcon from '@mui/icons-material/MilitaryTechTwoTone';
import { Confetti } from '../../components/confetti';
import { Layout } from '../../components/layout';
import { Score } from '../../components/score';
import { CapitalText, NormalText } from '../../components/text';
import { MenuIcon } from '../../components/icon';
import { MenuText } from '../../components/text';
import './Screen.css';

function PlayerRow({ player, isMe }) {
    const isTop = player.rank <= 3;
    return (
        <div className={`flex items-center rank-screen-row ${isMe ? 'rank-screen-row--me' : ''}`}>
            <Confetti isWinner={isMe} />
            <div
                className={`
                    flex items-center justify-center shrink-0 text-center
                    rank-screen-row__rank
                    ${isTop ? 'rank-screen-row__rank--top' : ''}
                `}
            >
                {isTop
                    ? <MenuIcon icon={MilitaryTechIcon} color={['gold', 'silver', 'bronze'][player.rank - 1]} />
                    : <MenuText text={`#${player.rank}`} />
                }
            </div>
            <div className="flex flex-col flex-1 min-w-0 rank-screen-row__info">
                <NormalText>{player.display_name}</NormalText>
                <CapitalText size="11">{player.matches}P · {player.wins}W · {player.losses}L · {player.draws}D</CapitalText>
            </div>
            <NormalText className="shrink-0 rank-screen-row__score">
                {player.score.toLocaleString()}
            </NormalText>
        </div>
    );
}

export default function Screen({
    loading, top100, myStats, myUserId, onBack
}) {
    return (
        <Layout title="Global Ranks" onBack={onBack}>
            <Score stats={myStats} loading={loading} />
            {top100.length > 0 && (
                <div className="flex flex-col overflow-hidden card-theme">
                    {top100.map(player => (
                        <PlayerRow key={player.id} player={player} isMe={player.id === myUserId} />
                    ))}
                </div>
            )}
        </Layout>
    );
}