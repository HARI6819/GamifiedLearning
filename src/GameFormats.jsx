import "./GameFormats.css";
import { useLanguage } from "./context/LanguageContext";
import useScrollAnimation from "./hooks/useScrollAnimation";

const GameCard = ({
  icon,
  title,
  description,
  level,
  time,
  link,
  gradient,
  playNowLabel
}) => {
  return (
    <div className="game-card reveal">
      <div className="game-top">
        <div className={`game-icon ${gradient}`}>
          <span>{icon}</span>
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <div className="game-bottom">
        <div className="game-meta">
          <span className="level">{level}</span>
          <span className="time">⏱ {time}</span>
        </div>

        <a href={link} className="play-btn">
          {playNowLabel} →
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
          <span className="badge">{t.home.gameFormats.badge}</span>
          <h2>{t.home.gameFormats.title}</h2>
          <p>{t.home.gameFormats.subtitle}</p>
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
          />
        </div>

        <div className="view-all">
          <a href="/games" className="view-btn">
            {t.home.gameFormats.viewAll} →
          </a>
        </div>
      </div>
    </section>
  );
};

export default GameFormats;
