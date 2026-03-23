import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Layout } from '../../components/layout';
import { MenuIcon } from '../../components/icon';
import { CapitalText, NormalText } from '../../components/text';
import { HOME_SCREEN_MENU } from '../../constants/menus';
import './HomeScreen.css';

export default function HomeScreen({
    displayName,
    isLoggedIn,
    onTimedMatch,
    onClassicMatch,
    onExploreRooms,
    onGlobalRanks,
    onNameSettings,
    onAbout,
    onLogout,
}) {
    const handlers = {
        timed: onTimedMatch,
        classic: onClassicMatch,
        explore: onExploreRooms,
        ranks: onGlobalRanks,
        'name-settings': onNameSettings,
        about: onAbout,
    };
    return (
        <Layout center>
            <div className="flex home-container">
                <div className="flex home-header">
                    <NormalText size="1">Tic Tac Toe</NormalText>
                    {isLoggedIn && <CapitalText>{displayName}</CapitalText>}
                </div>
                <div className="flex home-menu">
                    {HOME_SCREEN_MENU.map((group, gi) => (
                        <div key={group.group} className="flex home-menu__group">
                            {gi > 0 && <div className="home-menu__divider" />}
                            {group.items.map(item => (
                                <div key={item.key} className="flex home-menu__item" onClick={handlers[item.key]}>
                                    <MenuIcon icon={item.icon} color={item.color} size="md" />
                                    <NormalText className="home-menu__label">{item.label}</NormalText>
                                    <ChevronRightIcon className="home-menu__arrow" style={{ fontSize: 18 }} />
                                </div>
                            ))}
                        </div>
                    ))}
                    {isLoggedIn && (
                        <>
                            <div className="home-menu__divider" />
                            <div className="flex home-menu__item home-menu__item--danger" onClick={onLogout}>
                                <MenuIcon icon={<LogoutOutlinedIcon fontSize="small" />} color="danger" size="md" />
                                <NormalText className="home-menu__label" danger>Logout Player</NormalText>
                                <ChevronRightIcon className="home-menu__arrow" style={{ fontSize: 18 }} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}