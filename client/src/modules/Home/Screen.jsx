import LogoutIcon from '@mui/icons-material/LogoutTwoTone';
import ChevronRightIcon from '@mui/icons-material/ChevronRightTwoTone';
import { Layout } from '../../components/layout';
import { MenuIcon } from '../../components/icon';
import { CapitalText, NormalText } from '../../components/text';
import './Screen.css';

export default function HomeScreen({
    displayName, isLoggedIn, menuItems, onMenuSelect, onLogout,
}) {
    return (
        <Layout center>
            <div className="flex items-center justify-center flex-col gap-4">
                <NormalText size="1">Tic Tac Toe</NormalText>
                {isLoggedIn && <CapitalText>{displayName}</CapitalText>}
            </div>
            <div className="flex flex-col overflow-hidden card-theme">
                {menuItems.map((item, idx) => (
                    <div key={idx} className="flex flex-col">
                        {item.gi > 0 && idx === menuItems.findIndex(i => i.gi === item.gi) && (
                            <div className="h-px home-screen__divider" />
                        )}
                        <div
                            onClick={() => onMenuSelect(idx)}
                            className="flex items-center cursor-pointer card-theme-item home-screen__item"
                        >
                            <MenuIcon icon={item.icon} />
                            <NormalText className="flex-1">{item.label}</NormalText>
                            <ChevronRightIcon className="shrink-0 home-screen__arrow" style={{ fontSize: 18 }} />
                        </div>
                    </div>
                ))}
                {isLoggedIn && (
                    <>
                        <div className="h-px home-screen__divider" />
                        <div onClick={onLogout} className="flex items-center cursor-pointer card-theme-item home-screen__item home-screen__item--danger">
                            <MenuIcon icon={LogoutIcon} color="danger" />
                            <NormalText className="flex-1" danger>Logout Player</NormalText>
                            <ChevronRightIcon className="shrink-0 home-screen__arrow" style={{ fontSize: 18 }} />
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}