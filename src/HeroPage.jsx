
import './HeroPage.css'
import { Gamepad2, BookOpen, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router';
import { useLanguage } from './context/LanguageContext';
import useScrollAnimation from './hooks/useScrollAnimation';


function HeroPage() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    function handleExplore() {
        navigate('/learn');
    }

    function handleStartPlaying() {
        navigate('/games');
    }

    useScrollAnimation();

    return (
        <section className="hero">
            <div className="hero-content">
                {/* Badge */}
                <div className="hero-badge reveal stagger-1">
                    <p>🇮🇳</p>
                    <span>{t.home.heroBadge}</span>
                </div>

                {/* Heading */}
                <h1 className="hero-title reveal stagger-2">
                    <span className="title-primary">{t.home.heroTitle1}</span>
                    <br />
                    <span className="title-secondary">{t.home.heroTitle2}</span>
                </h1>

                {/* Hindi subtitle */}
                <p className="hero-hindi reveal stagger-3">{t.home.heroSubtitle}</p>

                {/* Description */}
                <p className="hero-desc reveal stagger-4">{t.home.heroDesc}</p>

                {/* Buttons */}
                <div className="hero-buttons reveal stagger-5">
                    <button className="btn-primary" onClick={handleStartPlaying}>
                        <Gamepad2 size={20} />
                        {t.home.startPlaying}
                        <ArrowRight size={20} />
                    </button>

                    <button className="btn-outline" onClick={handleExplore}>
                        <BookOpen size={20} />
                        {t.home.exploreArticles}
                    </button>
                </div>

                {/* Stats */}
                <div className="hero-stats reveal stagger-6">
                    <Stat number="3" label={t.home.stats.organs} c="color1" />
                    <Stat number="20+" label={t.home.stats.articles} c="color2" />
                    <Stat number="4" label={t.home.stats.modes} c="color3" />
                </div>
            </div>

            {/* Floating icons — different parallax speeds for depth */}
            <Floating icon="📜" className="float-left parallax-float-slow" />
            <Floating icon="⚖️" className="float-right parallax-float-fast" />
            <Floating icon="🏛️" className="float-bottom parallax-float-mid" />

        </section>
    )

};


/* Small components */
const Stat = ({ number, label, c }) => (
    <div className={`stat ${c}`}>
        <h3>{number}</h3>
        <p>{label}</p>
    </div>
);

const Floating = ({ icon, className }) => (
    <div className={`floating ${className}`}>{icon}</div>
);



export default HeroPage