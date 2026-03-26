import { Layout } from '../../components/layout';
import { NormalText } from '../../components/text';
import { ABOUT_SCREEN_MENU } from '../../constants/menus';
import './Screen.css';

export default function AboutScreen({ onBack }) {
    return (
        <Layout title="About Game" onBack={onBack}>
            <div className="flex flex-col overflow-hidden card-theme">
                <div className="flex flex-col about-screen-dev__top">
                    <NormalText size="3">Created by Arghadip Das</NormalText>
                </div>
                <div className="flex flex-col">
                    {ABOUT_SCREEN_MENU.map(row => (
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