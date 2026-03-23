import LogoutIcon from '@mui/icons-material/Logout';
import { Layout } from '../../components/layout';
import { Board } from '../../components/board';
import { RoundButton } from '../../components/button';
import { CapitalText, NormalText } from '../../components/text';
import './GameScreen.css';

const TURN_LIMIT = 30;
const DISCONNECT_GRACE = 60;

export default function GameScreen({
    cells, winCombo, turnText, isMyTurn,
    timeLeft, gameMode, isLoading,
    opponentDisconnected, opponentName,
    title, disconnectCountdown,
    onCellClick, onLeave,
}) {
    const isTimed = gameMode === 'timed';
    const leaveDisabled = opponentDisconnected && disconnectCountdown > 30;

    const text = opponentDisconnected
        ? `${opponentName} disconnected (${disconnectCountdown})`
        : isTimed
        ? `${turnText} (${timeLeft})`
        : turnText;

    const fill = opponentDisconnected
        ? ((DISCONNECT_GRACE - disconnectCountdown) / DISCONNECT_GRACE) * 100
        : isTimed && !isLoading
        ? ((TURN_LIMIT - timeLeft) / TURN_LIMIT) * 100
        : null;

    return (
        <Layout center className="gap-12">
            <div className="flex items-center justify-center flex-col gap-4">
                <NormalText size="1">Tic Tac Toe</NormalText>
                <CapitalText fill={isLoading ? '-1' : undefined}>{title}</CapitalText>
            </div>
            <div className="flex justify-center w-full">
                <Board
                    squares={cells}
                    onCellClick={onCellClick}
                    disabled={isLoading || opponentDisconnected}
                    winCombo={winCombo}
                    isMyTurn={isMyTurn && !opponentDisconnected && !isLoading}
                />
            </div>
            <div className="flex items-center justify-center flex-col gap-4">
                <CapitalText fill={fill}>{text}</CapitalText>
                <RoundButton onClick={onLeave} disabled={leaveDisabled}>
                    <LogoutIcon style={{ fontSize: 20 }} />
                </RoundButton>
            </div>
        </Layout>
    );
}