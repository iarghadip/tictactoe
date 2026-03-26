import LogoutIcon from '@mui/icons-material/LogoutTwoTone';
import { Layout } from '../../components/layout';
import { Board } from '../../components/board';
import { Button } from '../../components/button';
import { CapitalText, NormalText } from '../../components/text';
import './Screen.css';

export default function Screen({
    cells, winCombo, isMyTurn, isLoading, title, bottomText, bottomFill,
    opponentDisconnected, leaveDisabled, onCellClick, onLeave,
}) {
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
                    winCombo={winCombo}
                    isMyTurn={isMyTurn && !opponentDisconnected && !isLoading}
                    disabled={isLoading || opponentDisconnected}
                />
            </div>
            <div className="flex items-center justify-center flex-col gap-4">
                <CapitalText fill={bottomFill}>{bottomText}</CapitalText>
                <Button onClick={onLeave} icon={LogoutIcon} disabled={leaveDisabled} danger />
            </div>
        </Layout>
    );
}