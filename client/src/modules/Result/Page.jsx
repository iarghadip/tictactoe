import Screen from './Screen';

export default function ResultPage({
    turnText, myStats, myVoted, opponentVoted,
    onRematch, onLeave, title, isWinner
}) {
    return (
        <Screen
            turnText={turnText}
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