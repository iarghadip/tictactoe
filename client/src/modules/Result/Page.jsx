import Screen from './Screen';

export default function ResultPage({
    winText, myStats, myVoted, opponentVoted,
    onRematch, onLeave, title, isWinner
}) {
    return (
        <Screen
            winText={winText}
            myStats={myStats}
            myVoted={myVoted}
            opponentVoted={opponentVoted}
            onRematch={onRematch}
            onLeave={onLeave}
            title={title}
            isWinner={isWinner}
        />
    );
}