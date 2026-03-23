import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Layout } from '../../components/layout';
import { MenuIcon } from '../../components/icon';
import { CapitalText, NormalText } from '../../components/text';
import { HOME_SCREEN_MENU } from '../../constants/menus';
import './HomeScreen.css';

export default function HomeScreen({
    displayName, isLoggedIn, onMenuSelect, onLogout,
}) {
    let cursor = 0;

    return (
        <Layout center>
            <div className="flex items-center justify-center flex-col gap-4">
                <NormalText size="1">Tic Tac Toe</NormalText>
                {isLoggedIn && <CapitalText>{displayName}</CapitalText>}
            </div>
            <div className="flex flex-col overflow-hidden home-menu">
                {HOME_SCREEN_MENU.map((group, gi) => (
                    <div key={group.group} className="flex flex-col">
                        {gi > 0 && <div className="h-px home-menu__divider" />}
                        {group.items.map(item => {
                            const idx = cursor++;
                            return (
                                <div
                                    key={item.key}
                                    onClick={() => onMenuSelect(idx)}
                                    className="flex items-center cursor-pointer home-menu__item"
                                >
                                    <MenuIcon icon={item.icon} color={item.color} size="md" />
                                    <NormalText className="flex-1">{item.label}</NormalText>
                                    <ChevronRightIcon className="shrink-0 home-menu__arrow" style={{ fontSize: 18 }} />
                                </div>
                            );
                        })}
                    </div>
                ))}
                {isLoggedIn && (
                    <>
                        <div className="h-px home-menu__divider" />
                        <div onClick={onLogout} className="flex items-center cursor-pointer home-menu__item home-menu__item--danger">
                            <MenuIcon icon={<LogoutOutlinedIcon fontSize="small" />} color="danger" size="md" />
                            <NormalText className="flex-1" danger>Logout Player</NormalText>
                            <ChevronRightIcon className="shrink-0 home-menu__arrow" style={{ fontSize: 18 }} />
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}