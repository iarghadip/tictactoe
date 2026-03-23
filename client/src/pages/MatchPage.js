import { useEffect, useState, useRef } from 'react';
import { useNakama } from '../contexts/nakamaContext';
import { MatchScreen } from '../screens/match';

export default function MatchPage({
    mode, roomId, onFound, onCancel
}) {
    const { socket, account } = useNakama();
    const [elapsed, setElapsed] = useState(0);
    const ticketRef = useRef(null);
    const onFoundRef = useRef(onFound);
    const activeRef = useRef(true);
    const cancelBtnRef = useRef(null);

    useEffect(() => {
        onFoundRef.current = onFound;
    }, [onFound]);

    const displayName = account?.user?.display_name || 'Anonymous';

    useEffect(() => {
        if (elapsed === 300 && cancelBtnRef.current) {
            cancelBtnRef.current.click();
        }
    }, [elapsed]);

    useEffect(() => {
        if (!socket) return;
        activeRef.current = true;

        socket.onmatchmakermatched = async (matched) => {
            if (!activeRef.current) return;
            try {
                const token = matched.token || matched.matchmakerTicket?.token;
                const matchId = matched.match_id || matched.matchId || null;
                const match = await socket.joinMatch(matchId, null, token);
                ticketRef.current = null;
                onFoundRef.current(match);
            } catch (e) {}
        };

        let query = '+properties.mode:' + mode;
        if (roomId) {
            query += ` +properties.room_id:${roomId}`;
        }

        socket.addMatchmaker(
            query,
            2, 2,
            { mode: mode, room_id: roomId || 'global' },
            {}
        )
            .then((result) => {
                ticketRef.current = result.ticket;
            })
            .catch((e) => {});

        const timer = setInterval(() => setElapsed(s => s + 1), 1000);

        return () => {
            activeRef.current = false;
            clearInterval(timer);
            if (ticketRef.current) {
                socket.removeMatchmaker(ticketRef.current).catch(() => {});
                ticketRef.current = null;
            }
        };
    }, [socket, mode, roomId]);

    return (
        <MatchScreen
            elapsed={elapsed}
            displayName={displayName}
            onCancel={onCancel}
            cancelBtnRef={cancelBtnRef}
        />
    );
}