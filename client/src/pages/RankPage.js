import { useEffect, useState } from 'react';
import { useNakama } from '../contexts/nakamaContext';
import { RankScreen } from '../screens/rank';

export default function RankPage({ onBack }) {
    const { client, session, account } = useNakama();
    const [loading, setLoading] = useState(true);
    const [top100, setTop100] = useState([]);
    const [myStats, setMyStats] = useState(null);

    const myUserId = account?.user?.id;

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const result = await client.rpc(session, 'get_leaderboard', {});
                const data = result.payload;
                setTop100(data.players || []);
                setMyStats(data.myStats || null);
            } catch (e) {
                console.error('Failed to fetch leaderboard:', e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [client, session]);

    return (
        <RankScreen
            loading={loading}
            top100={top100}
            myStats={myStats}
            myUserId={myUserId}
            onBack={onBack}
        />
    );
}