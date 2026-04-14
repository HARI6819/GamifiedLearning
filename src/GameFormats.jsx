import "./GameFormats.css";
import { useLanguage } from "./context/LanguageContext";
import useScrollAnimation from "./hooks/useScrollAnimation";
import TranslatedText from "./TranslatedText";

const GameCard = ({
  icon,
  title,
  description,
  level,
  time,
  link,
  gradient,
  playNowLabel,
  stagger
}) => {
  return (
    <div className={`game-card reveal ${stagger || ''}`}>
      <div className="game-top">
        <div className={`game-icon ${gradient}`}>
          <span>{icon}</span>
        </div>
        <h3><TranslatedText>{title}</TranslatedText></h3>
        <p><TranslatedText>{description}</TranslatedText></p>
      </div>

      <div className="game-bottom">
        <div className="game-meta">
          <span className="level"><TranslatedText>{level}</TranslatedText></span>
          <span className="time">⏱ <TranslatedText>{time}</TranslatedText></span>
        </div>

        <a href={link} className="play-btn">
          <TranslatedText>{playNowLabel}</TranslatedText> →
        </a>
      </div>
    </div>
  );
};

const GameFormats = () => {
  const { t } = useLanguage();

  useScrollAnimation();

  return (
    <section className="games-section">
      <div className="games-container">
        <div className="games-header">
          <span className="badge"><TranslatedText>{t.home.gameFormats.badge}</TranslatedText></span>
          <h2><TranslatedText>{t.home.gameFormats.title}</TranslatedText></h2>
          <p><TranslatedText>{t.home.gameFormats.subtitle}</TranslatedText></p>
        </div>

        <div className="games-grid">
          <GameCard
            icon="🎡"
            title={t.home.gameFormats.games.wheel.title}
            description={t.home.gameFormats.games.wheel.desc}
            level={t.home.gameFormats.games.wheel.level}
            time={t.home.gameFormats.games.wheel.time}
            link="/games/spin-wheel"
            gradient="saffron"
            playNowLabel={t.home.gameFormats.playNow}
            stagger="stagger-1"
          />

          <GameCard
            icon="🃏"
            title={t.home.gameFormats.games.cards.title}
            description={t.home.gameFormats.games.cards.desc}
            level={t.home.gameFormats.games.cards.level}
            time={t.home.gameFormats.games.cards.time}
            link="/games/quiz-cards"
            gradient="emerald"
            playNowLabel={t.home.gameFormats.playNow}
            stagger="stagger-2"
          />

          <GameCard
            icon="🐍"
            title={t.home.gameFormats.games.climb.title}
            description={t.home.gameFormats.games.climb.desc}
            level={t.home.gameFormats.games.climb.level}
            time={t.home.gameFormats.games.climb.time}
            link="/games/snake-ladder"
            gradient="saffphire"
            playNowLabel={t.home.gameFormats.playNow}
            stagger="stagger-3"
          />

          <GameCard
            icon="🎴"
            title={t.home.gameFormats.games.match.title}
            description={t.home.gameFormats.games.match.desc}
            level={t.home.gameFormats.games.match.level}
            time={t.home.gameFormats.games.match.time}
            link="/games/match-pairs"
            gradient="gold"
            playNowLabel={t.home.gameFormats.playNow}
            stagger="stagger-4"
          />
        </div>

        <div className="view-all">
          <a href="/games" className="view-btn">
            <TranslatedText>{t.home.gameFormats.viewAll}</TranslatedText> →
          </a>
        </div>
      </div>
    </section>
  );
};

export default GameFormats;
