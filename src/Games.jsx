import React, { useState, useEffect, useRef } from "react";
import "./Games.css";
import { Gamepad2, Clock, ArrowRight, Star, Lock, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from './Footer'
import { useLanguage } from "./context/LanguageContext";
import config from "./config";
import useScrollAnimation from "./hooks/useScrollAnimation";

export default function Games() {
  const { t } = useLanguage();
  const [completedLevels, setCompletedLevels] = useState({
    articleMatch: [],
    rightsDutiesClimb: [],
    constitutionCards: [],
    chakra: [],
    quiz: [],
    sort: [],
    crossroads: [],
    justiceJury: [],
    reverseHangman: [],
  });
  const [loading, setLoading] = useState(true);
  const [articlesRead, setArticlesRead] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeDot, setActiveDot] = useState(null);
  const [hoveredGame, setHoveredGame] = useState(null);
  const [clickedGame, setClickedGame] = useState(null);
  const mainRef = useRef(null);
  const lockRef = useRef(null);

  useEffect(() => {
    const fetchProgress = async () => {
      const email = localStorage.getItem('userEmail');
      const isGuest = localStorage.getItem('isGuest') === 'true';
      console.log("Games fetchProgress check:", { email, isGuest });
      if (!email || isGuest) {
        if (isGuest) console.log("Guest mode detected in Games page, skipping API fetch.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${config.API_URL}/api/progress/${email}`, {
          headers: { "ngrok-skip-browser-warning": "true" }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.completedLevels) {
            // Ensure all games have arrays with proper defaults
            const normalizedLevels = {
              articleMatch: data.completedLevels.articleMatch || [],
              rightsDutiesClimb: data.completedLevels.rightsDutiesClimb || [],
              constitutionCards: data.completedLevels.constitutionCards || [],
              chakra: data.completedLevels.chakra || [],
              quiz: data.completedLevels.quiz || [],
              sort: data.completedLevels.sort || [],
              crossroads: data.completedLevels.crossroads || [],
              justiceJury: data.completedLevels.justiceJury || [],
              reverseHangman: data.completedLevels.reverseHangman || [],
            };
            console.log("📊 Games.jsx - Normalized completed levels:", normalizedLevels);
            setCompletedLevels(normalizedLevels);
          }
          setArticlesRead(data.articlesRead || 0);
        }
      } catch (e) {
        console.error("Failed to fetch progress", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const gamesList = [
    { id: "chakra", title: t.home.gameFormats.games.wheel.title, desc: t.home.gameFormats.games.wheel.desc, time: t.home.gameFormats.games.wheel.time, icon: "🎡", color: "saffron", link: "/games/spin-wheel" },
    { id: "constitutionCards", title: t.home.gameFormats.games.cards.title, desc: t.home.gameFormats.games.cards.desc, time: t.home.gameFormats.games.cards.time, icon: "🃏", color: "green", link: "/games/quiz-cards" },
    { id: "rightsDutiesClimb", title: t.home.gameFormats.games.climb.title, desc: t.home.gameFormats.games.climb.desc, time: t.home.gameFormats.games.climb.time, icon: "🐍", color: "blue", link: "/games/snake-ladder" },
    { id: "articleMatch", title: t.home.gameFormats.games.match.title, desc: t.home.gameFormats.games.match.desc, time: t.home.gameFormats.games.match.time, icon: "🎴", color: "gold", link: "/games/match-pairs" },
    { id: "quiz", title: t.home.gameFormats.games.quiz.title, desc: t.home.gameFormats.games.quiz.desc, time: t.home.gameFormats.games.quiz.time, icon: "🧠", color: "purple", link: "/games/quiz" },
    { id: "sort", title: t.constitutionalSort.title, desc: t.constitutionalSort.desc, time: t.constitutionalSort.time, icon: "⫽", color: "gold", link: "/games/constitutional-sort" },
    { id: "crossroads", title: t.constitutionalCrossroads.title, desc: t.constitutionalCrossroads.desc, time: t.constitutionalCrossroads.time, icon: "⚖️", color: "blue", link: "/games/constitutional-crossroads" },
    { id: "justiceJury", title: t.justiceJury.title, desc: t.justiceJury.desc, time: t.justiceJury.time, icon: "⚖️", color: "purple", link: "/games/justice-jury" },
    { id: "reverseHangman", title: t.reverseHangman.title, desc: t.reverseHangman.desc, time: t.reverseHangman.time, icon: "🛡️", color: "green", link: "/games/reverse-hangman" },

  ];

  // Logic to determine global unlocks (all games including justiceJury)
  const primaryGames = ["articleMatch", "rightsDutiesClimb", "constitutionCards", "chakra", "quiz", "sort", "crossroads", "justiceJury", "reverseHangman"];
  const isEasyDone = primaryGames.every(g => completedLevels[g]?.includes("Easy"));
  const isMediumDone = primaryGames.every(g => completedLevels[g]?.includes("Medium"));
  const isHardDone = primaryGames.every(g => completedLevels[g]?.includes("Hard"));

  // Debug logging for tier calculation
  useEffect(() => {
    console.log("🎮 PRIMARY GAMES TIER CHECK:");
    console.log("   Primary games:", primaryGames);
    primaryGames.forEach(g => {
      const levels = completedLevels[g] || [];
      console.log(`   ${g}: ${levels.length === 0 ? "❌ NONE" : levels.join(", ")}`);
    });
    console.log(`   isEasyDone: ${isEasyDone} | isMediumDone: ${isMediumDone}`);
    console.log(`   => Global Tier: ${getGlobalLevel()}`);
  }, [completedLevels]);

  const toggleDot = (id) => {
    setActiveDot(prev => prev === id ? null : id);
  };

  const getGlobalLevel = () => {
    if (isMediumDone) return "Hard";
    if (isEasyDone) return "Medium";
    return "Easy";
  };

  const globalLevel = getGlobalLevel();

  useScrollAnimation();

  const getLevelStatus = (gameId) => {
    const completed = completedLevels[gameId] || [];
    if (completed.includes("Hard")) return { label: t.gamesPage.progression.status.completedAll, color: "#166534" };
    if (completed.includes("Medium")) return { label: `${t.gamesPage.progression.status.next}: ${t.common.difficulty.Hard}`, color: "#d97706" };
    if (completed.includes("Easy")) return { label: `${t.gamesPage.progression.status.next}: ${t.common.difficulty.Medium}`, color: "#d97706" };
    return { label: `${t.gamesPage.progression.status.next}: ${t.common.difficulty.Easy}`, color: "#1e3a8a" };
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div>{t.gamesPage.progression.loading}</div>;
  }

  return (
    <>
      <Navbar />
      <main className="gamehub1" ref={mainRef}>
        {localStorage.getItem('isGuest') === 'true' && (
          <div className="guest-restriction-overlay animated fadeIn">
            <div className="glossy-card-guest">
              <span className="lock-icon-guest">🔒</span>
              <h2>{t.login.guestRestrictedTitle || "Access Restricted"}</h2>
              <p>{t.login.guestRestrictedMsg || "Please login to access the full game experience and track your progress."}</p>
              <button className="login-redirect-btn" onClick={() => { localStorage.clear(); window.location.href = '/'; }}>
                {t.login.login || "Login Now"}
              </button>
            </div>
          </div>
        )}
        {articlesRead < 10 && (
          <div className="locked-overlay">
            <div className="locked-card" ref={lockRef}>
              <div className="lock-icon-wrapper">
                <Lock size={48} />
              </div>
              <h2>{t.gamesPage.lockedMessage}</h2>
              <div className="unlock-progress">
                <div className="progress-text">
                  <span>{articlesRead} / 10 {t.gamesPage.articlesToUnlock}</span>
                </div>
                <div className="progress-bar-mini">
                  <div className="fill" style={{ width: `${(articlesRead / 10) * 100}%` }}></div>
                </div>
              </div>
              <Link to="/learn" className="unlock-btn">
                {t.home.exploreArticles}
              </Link>
            </div>
          </div>
        )}
        <div className="container1">
          <div className="header1 reveal-up stagger-1">
            <span className="pill1">
              <Gamepad2 size={14} />
              {t.gamesPage.hub}
            </span>
            <h1>{t.gamesPage.title}</h1>
            <p>{t.gamesPage.subtitle}</p>
            <div className="progression-status">
              <div className="current-tier">
                <span>{t.gamesPage.progression.currentTier}: <strong>{t.common.difficulty[globalLevel]}</strong></span>
                {!isMediumDone && (
                  <span className="unlock-hint">
                    {globalLevel === "Easy" ? t.gamesPage.progression.unlockedMedium : t.gamesPage.progression.unlockedHard}
                  </span>
                )}
              </div>

              {/* Progress toward next tier */}
              <div className="tier-progress">
                {globalLevel === "Easy" && !isMediumDone && (
                  <div className="progress-section">
                    <div className="progress-label">
                      <span>📈 Progress to Medium Tier</span>
                      <span className="progress-count">
                        {primaryGames.filter(g => completedLevels[g]?.includes("Easy")).length} / {primaryGames.length} games
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(primaryGames.filter(g => completedLevels[g]?.includes("Easy")).length / primaryGames.length) * 100}%` }}
                      ></div>
                    </div>
                    <div className="games-status">
                      {primaryGames.map(g => {
                        const gameTitle = gamesList.find(x => x.id === g)?.title || g;
                        return (
                          <div
                            key={g}
                            className={`game-dot ${completedLevels[g]?.includes("Easy") ? "completed" : "pending"}`}
                            style={clickedGame === g ? { background: 'green' } : {}}
                            onMouseEnter={() => setHoveredGame(g)}
                            onMouseLeave={() => setHoveredGame(null)}
                            onClick={() => setClickedGame(prev => prev === g ? null : g)}
                          >
                            {completedLevels[g]?.includes("Easy") ? "✓" : "○"}
                            {hoveredGame === g && (
                              <div className="game-dot-tooltip">
                                {gameTitle}
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {globalLevel === "Medium" && !isMediumDone && (
                  <div className="progress-section">
                    <div className="progress-label">
                      <span>📈 Progress to Hard Tier</span>
                      <span className="progress-count">
                        {primaryGames.filter(g => completedLevels[g]?.includes("Medium")).length} / {primaryGames.length} games
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(primaryGames.filter(g => completedLevels[g]?.includes("Medium")).length / primaryGames.length) * 100}%` }}
                      ></div>
                    </div>
                    <div className="games-status">
                      {primaryGames.map(g => {
                        const gameTitle = gamesList.find(x => x.id === g)?.title || g;
                        return (
                          <div
                            key={g}
                            className={`game-dot ${completedLevels[g]?.includes("Medium") ? "completed" : "pending"}`}
                            style={clickedGame === g ? { background: 'green' } : {}}
                            onMouseEnter={() => setHoveredGame(g)}
                            onMouseLeave={() => setHoveredGame(null)}
                            onClick={() => setClickedGame(prev => prev === g ? null : g)}
                          >
                            {completedLevels[g]?.includes("Medium") ? "✓" : "○"}
                            {hoveredGame === g && (
                              <div className="game-dot-tooltip">
                                {gameTitle}
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {globalLevel === "Hard" && (
                  <div className="progress-section completed-all">
                    {isHardDone ? <span>🏆 All Games Completed!</span> : <span>🏆 You are in last tier!</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="category-filter-bar">
              {["All", "Legislature", "Executive", "Judiciary"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-btn ${selectedCategory === cat ? "active" : ""}`}
                >
                  {cat === "All" ? t.learn.filters.all : (cat === "Legislature" ? t.home.pillars.legislature.title : (cat === "Executive" ? t.home.pillars.executive.title : t.home.pillars.judiciary.title))}
                </button>
              ))}
            </div>
          </div>

          <div className="game-grid1">
            {gamesList.map((game, index) => {
              const status = getLevelStatus(game.id);
              const isGameDoneAtGlobalLevel = completedLevels[game.id]?.includes(globalLevel);
              const staggerClass = `stagger-${Math.min(index + 1, 6)}`;

              return (
                <div className={`game-card1 reveal-up ${staggerClass}`} key={game.id}>
                  <div className={`top-bar1 ${game.color}`} />
                  <div className="card-body1">
                    <div className="card-header1">
                      <div className={`icon-box1 ${game.color}`}>
                        <span>{game.icon}</span>
                      </div>
                      <div className="status-pill" style={{ backgroundColor: status.color + '22', color: status.color }}>
                        {isGameDoneAtGlobalLevel && <CheckCircle2 size={12} style={{ marginRight: 4 }} />}
                        {status.label}
                      </div>
                    </div>
                    <h3>{game.title}</h3>
                    <p className="desc1">{game.desc}</p>
                  </div>
                  <div className="card-footer1">
                    <span className="time1">
                      <Clock size={14} /> {game.time}
                    </span>
                    <Link to={`${game.link}${selectedCategory !== "All" ? `?category=${selectedCategory}` : ""}`} className="play-btn1">
                      {t.home.gameFormats.playNow} <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>


          {/* Footer Box */}
          <div className="coming-soon1">
            <Star size={42} color={"#F59426"} />
            <h3>{t.gamesPage.comingSoon.title}</h3>
            <p>
              {t.gamesPage.comingSoon.desc}
            </p>
          </div>

        </div>
      </main>
      <section>
        <Footer />
      </section>
    </>
  );
}
