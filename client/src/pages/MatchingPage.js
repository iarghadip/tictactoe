import { useEffect, useState, useRef } from 'react';
import { useNakama } from '../contexts/nakamaContext';
import { MatchingScreen } from '../screens/matching';

export default function MatchingPage({ onFound, onCancel }) {
    const { socket, account } = useNakama();
    const [elapsed, setElapsed] = useState(0);
    const ticketRef = useRef(null);

    const displayName = account?.user?.display_name || 'Anonymous';

    useEffect(() => {
        if (!socket) return;

        console.log('MatchingPage: socket ready, joining matchmaker');

        socket.onmatchmakermatched = (matched) => {
            console.log('MatchingPage: match found', matched);
            onFound(matched);
        };

        socket.addMatchmaker('*', 2, 2)
            .then((result) => {
                ticketRef.current = result.ticket;
                console.log('MatchingPage: matchmaker ticket', result.ticket);
            })
            .catch((e) => {
                console.error('MatchingPage: matchmaker error', JSON.stringify(e));
            });

        const timer = setInterval(() => setElapsed(s => s + 1), 1000);

        return () => {
            console.log('MatchingPage: cleanup, removing matchmaker');
            clearInterval(timer);
            if (ticketRef.current) {
                socket.removeMatchmaker(ticketRef.current).catch(() => {});
                ticketRef.current = null;
            }
        };
    }, [socket, onFound]);

    return <MatchingScreen elapsed={elapsed} displayName={displayName} onCancel={onCancel} />;
}