import { useEffect, useState } from 'react';
import { useNakama } from '../../contexts/nakamaContext';
import Screen from './Screen';

export default function RankPage({ onBack }) {
    const { client, session, account } = useNakama();
    const [loading, setLoading] = useState(true);
    const [top100, setTop100] = useState([]);
    const [myStats, setMyStats] = useState(null);

    const myUserId = account?.user?.id;

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!session || !myUserId) return;
            
            setLoading(true);
            try {
                const result = await client.listLeaderboardRecords(session, 'tictactoe', [myUserId], 100);
                
                const mappedPlayers = (result.records || []).map(record => {
                    const matches = record.metadata?.matches || 0;
                    const wins = record.metadata?.wins || 0;
                    const losses = record.metadata?.losses || 0;
                    const draws = matches - (wins + losses);
                    return {
                        id: record.owner_id,
                        display_name: record.username || 'Anonymous',
                        score: parseInt(record.score, 10),
                        rank: parseInt(record.rank, 10),
                        matches,
                        wins,
                        losses,
                        draws
                    };
                });

                setTop100(mappedPlayers);

                if (result.owner_records && result.owner_records.length > 0) {
                    const myRecord = result.owner_records[0];
                    const rankIdx = mappedPlayers.findIndex(p => p.id === myUserId);
                    const rank = rankIdx >= 0 ? rankIdx + 1 : parseInt(myRecord.rank, 10) || 0;
                    const matches = myRecord.metadata?.matches || 0;
                    const wins = myRecord.metadata?.wins || 0;
                    const losses = myRecord.metadata?.losses || 0;
                    const draws = matches - (wins + losses);
                    setMyStats({
                        id: myRecord.owner_id,
                        display_name: myRecord.username || 'Anonymous',
                        score: parseInt(myRecord.score, 10),
                        rank,
                        matches,
                        wins,
                        losses,
                        draws
                    });
                } else {
                    setMyStats(null);
                }
            } catch (e) {
                console.error('Failed to fetch rank:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [client, session, myUserId]);

    return (
        <Screen
            loading={loading}
            top100={top100}
            myStats={myStats}
            myUserId={myUserId}
            onBack={onBack}
        />
    );
}