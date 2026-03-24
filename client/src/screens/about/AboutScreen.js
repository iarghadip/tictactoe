import { Layout } from '../../components/layout';
import { MenuIcon } from '../../components/icon';
import { NormalText } from '../../components/text';
import { ABOUT_SCREEN_MENU_1, ABOUT_SCREEN_MENU_2 } from '../../constants/menus';
import './AboutScreen.css';

export default function AboutScreen({ onBack }) {
    return (
        <Layout title="About Game" onBack={onBack}>
            <div className="flex flex-col overflow-hidden card-theme">
                {ABOUT_SCREEN_MENU_1.map(feature => (
                    <div key={feature.name} className="flex items-center card-theme-item about-screen-feature">
                        <MenuIcon icon={feature.icon} />
                        <div className="flex flex-col gap-1 flex-1 min-w-0 about-screen-feature__body">
                            <NormalText>{feature.name}</NormalText>
                            <NormalText size="4">{feature.desc}</NormalText>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-col overflow-hidden card-theme">
                <div className="flex flex-col about-screen-dev__top">
                    <NormalText size="3">Created by Arghadip Das</NormalText>
                </div>
                <div className="flex flex-col">
                    {ABOUT_SCREEN_MENU_2.map(row => (
                        <div key={row.key} className="flex items-center justify-between about-screen-dev__row">
                            <NormalText size="4">{row.key}</NormalText>
                            <NormalText size="4" className="text-right">{row.val}</NormalText>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}