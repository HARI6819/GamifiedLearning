import "./Pillars.css";

import { useNavigate } from 'react-router-dom'
import { useLanguage } from "./context/LanguageContext";
import useScrollAnimation from "./hooks/useScrollAnimation";
import TranslatedText from "./TranslatedText";


const PillarCard = ({ icon, title, description, articles, link, accent, articlesLabel, exploreLabel, stagger }) => {

  return (
    <div className={`pillar-card ${accent} reveal ${stagger || ''}`}>
      <div className="pillar-header">
        <div className="pillar-icon">{icon}</div>
        <h3><TranslatedText>{title}</TranslatedText></h3>
      </div>

      <div className="pillar-body">
        <p><TranslatedText>{description}</TranslatedText></p>

        <div className="pillar-footer">
          <span>{articles} <TranslatedText>{articlesLabel}</TranslatedText></span>
          <a href={link} className="explore-btn">
            <TranslatedText>{exploreLabel}</TranslatedText> →
          </a>
        </div>
      </div>
    </div>
  );
};

const Pillars = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  useScrollAnimation();

  return (
    <section className="pillars-section">
      <div className="pillars-container">
        <div className="pillars-heading">
          <h2><TranslatedText>{t.home.pillars.title}</TranslatedText></h2>
          <p><TranslatedText>{t.home.pillars.subtitle}</TranslatedText></p>
        </div>

        <div className="pillars-grid">
          <PillarCard
            icon="📜"
            title={t.home.pillars.legislature.title}
            description={t.home.pillars.legislature.desc}
            articles={8}
            link="/learn?category=Legislature"
            accent="secondary"
            articlesLabel={t.home.pillars.articles}
            exploreLabel={t.home.pillars.explore}
            stagger="stagger-1"
          />

          <PillarCard
            icon="🏛️"
            title={t.home.pillars.executive.title}
            description={t.home.pillars.executive.desc}
            articles={8}
            link="/learn?category=Executive"
            accent="primary"
            articlesLabel={t.home.pillars.articles}
            exploreLabel={t.home.pillars.explore}
            stagger="stagger-2"
          />

          <PillarCard
            icon="⚖️"
            title={t.home.pillars.judiciary.title}
            description={t.home.pillars.judiciary.desc}
            articles={6}
            link="/learn?category=Judiciary"
            accent="accent"
            articlesLabel={t.home.pillars.articles}
            exploreLabel={t.home.pillars.explore}
            stagger="stagger-3"
          />
        </div>
      </div>
    </section>
  );
};

export default Pillars;


