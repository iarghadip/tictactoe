import { Layout } from '../../components/layout';
import { MenuIcon } from '../../components/icon';
import { NormalText } from '../../components/text';
import { ABOUT_SCREEN_MENU_1, ABOUT_SCREEN_MENU_2 } from '../../constants/menus';
import './AboutScreen.css';

export default function AboutScreen({ onBack }) {
    return (
        <Layout title="About Game" onBack={onBack}>
            <div className="about-features">
                {ABOUT_SCREEN_MENU_1.map(feature => (
                    <div className="flex about-feature" key={feature.name}>
                        <MenuIcon icon={feature.icon} color={feature.color} size="sm" />
                        <div className="flex about-feature__body">
                            <NormalText>{feature.name}</NormalText>
                            <NormalText size="4">{feature.desc}</NormalText>
                        </div>
                    </div>
                ))}
            </div>
            <div className="about-dev">
                <div className="about-dev__top">
                    <NormalText size="3">Created by Arghadip Das</NormalText>
                </div>
                <div className="about-dev__rows">
                    {ABOUT_SCREEN_MENU_2.map(row => (
                        <div className="flex about-dev__row" key={row.key}>
                            <NormalText size="4">{row.key}</NormalText>
                            <NormalText size="4" className="about-dev__val">{row.val}</NormalText>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}