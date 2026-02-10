import React, { useState, useEffect, useRef } from "react";
import "./Games.css";
import { Gamepad2, Clock, ArrowRight, Star, Lock, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from './Footer'
import { useLanguage } from "./context/LanguageContext";
import config from "./config";

export default function Games() {
  const { t } = useLanguage();
  const [completedLevels, setCompletedLevels] = useState({
    articleMatch: [],
    rightsDutiesClimb: [],
    constitutionCards: [],
    chakra: [],
    quiz: []
  });
  const [loading, setLoading] = useState(true);
  const [articlesRead, setArticlesRead] = useState(0);
  const mainRef = useRef(null);
  const lockRef = useRef(null);

  useEffect(() => {
    const fetchProgress = async () => {
      const email = localStorage.getItem('userEmail');
      if (!email) {
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
            setCompletedLevels(data.completedLevels);
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

  useEffect(() => {
    if (!loading && articlesRead < 10) {
      const timer = setTimeout(() => {
        if (lockRef.current) {
          lockRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300); // Slightly longer delay to ensure full render
      return () => clearTimeout(timer);
    }
  }, [loading, articlesRead]);

  const gamesList = [
    { id: "chakra", title: t.home.gameFormats.games.wheel.title, desc: t.home.gameFormats.games.wheel.desc, time: t.home.gameFormats.games.wheel.time, icon: "🎡", color: "saffron", link: "/games/spin-wheel" },
    { id: "constitutionCards", title: t.home.gameFormats.games.cards.title, desc: t.home.gameFormats.games.cards.desc, time: t.home.gameFormats.games.cards.time, icon: "🃏", color: "green", link: "/games/quiz-cards" },
    { id: "rightsDutiesClimb", title: t.home.gameFormats.games.climb.title, desc: t.home.gameFormats.games.climb.desc, time: t.home.gameFormats.games.climb.time, icon: "🐍", color: "blue", link: "/games/snake-ladder" },
    { id: "articleMatch", title: t.home.gameFormats.games.match.title, desc: t.home.gameFormats.games.match.desc, time: t.home.gameFormats.games.match.time, icon: "🎴", color: "gold", link: "/games/match-pairs" },
    { id: "quiz", title: "Constitutional Quiz", desc: "Test your knowledge with 10 questions and a timer!", time: "5-10 mins", icon: "🧠", color: "purple", link: "/games/quiz" },
  ];

  // Logic to determine global unlocks
  const allGames = ["articleMatch", "rightsDutiesClimb", "constitutionCards", "chakra", "quiz"];
  const isEasyDone = allGames.every(g => completedLevels[g]?.includes("Easy"));
  const isMediumDone = allGames.every(g => completedLevels[g]?.includes("Medium"));

  const getGlobalLevel = () => {
    if (isMediumDone) return "Hard";
    if (isEasyDone) return "Medium";
    return "Easy";
  };

  const globalLevel = getGlobalLevel();

  const getLevelStatus = (gameId) => {
    const completed = completedLevels[gameId] || [];
    if (completed.includes("Hard")) return { label: "Completed All", color: "#166534" };
    if (completed.includes("Medium")) return { label: "Next: Hard", color: "#d97706" };
    if (completed.includes("Easy")) return { label: "Next: Medium", color: "#d97706" };
    return { label: "Next: Easy", color: "#1e3a8a" };
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div>Loading Games...</div>;
  }

  return (
    <>
      <Navbar />
      <main className="gamehub1" ref={mainRef}>
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
          <div className="header1">
            <span className="pill1">
              <Gamepad2 size={14} />
              {t.gamesPage.hub}
            </span>
            <h1>{t.gamesPage.title}</h1>
            <p>{t.gamesPage.subtitle}</p>
            <div className="progression-status">
              <div className="current-tier">
                <span>Current Tier: <strong>{globalLevel}</strong></span>
                {!isMediumDone && (
                  <span className="unlock-hint">
                    {globalLevel === "Easy" ? "Complete Easy level of all games to unlock Medium Tier" : "Complete Medium level of all games to unlock Hard Tier"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="game-grid1">
            {gamesList.map((game) => {
              const status = getLevelStatus(game.id);
              const isGameDoneAtGlobalLevel = completedLevels[game.id]?.includes(globalLevel);

              return (
                <div className="game-card1" key={game.id}>
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
                    <Link to={game.link} className="play-btn1">
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
