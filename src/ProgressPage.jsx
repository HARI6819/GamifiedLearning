import React, { useState, useEffect } from "react";
import "./ProgressPage.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLanguage } from "./context/LanguageContext";
import { useNavigate } from "react-router";
import config from "./config";
import useScrollAnimation from "./hooks/useScrollAnimation";
import TranslatedText from "./TranslatedText";

const ProgressPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  useScrollAnimation();
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    articlesRead: 0,
    totalPoints: 0,
    mastery: { executive: 0, legislature: 0, judiciary: 0 },
    pointsBreakdown: {
      articleMatch: 0,
      rightsDutiesClimb: 0,
      constitutionCards: 0,
      chakra: 0,
      learn: 0,
      quiz: 0,
      sort: 0,
      timeline: 0,
      crossroads: 0,
      justiceJury: 0,
      reverseHangman: 0
    }
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeTab, setActiveTab] = useState('overall');
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false);

  const leaderboardTabs = [
    { id: 'overall', label: 'Overall', icon: '🏆' },
    { id: 'quiz', label: t.home.gameFormats.games.quiz.title, icon: '🃏' },
    { id: 'constitutionCards', label: t.home.gameFormats.games.cards.title, icon: '📚' },
    { id: 'articleMatch', label: t.home.gameFormats.games.match.title, icon: '🧠' },
    { id: 'rightsDutiesClimb', label: t.home.gameFormats.games.climb.title, icon: '🎲' },
    { id: 'chakra', label: t.home.gameFormats.games.wheel.title, icon: '🎡' },
    { id: 'sort', label: t.constitutionalSort.title, icon: '⫽' },
    { id: 'crossroads', label: t.constitutionalCrossroads.title, icon: '🧩' },
    { id: 'justiceJury', label: t.justiceJury.title, icon: '⚖️' },
    { id: 'reverseHangman', label: t.reverseHangman.title, icon: '🛡️' },
  ];

  const fetchLeaderboard = async (type) => {
    setLeaderboardLoading(true);
    try {
      const lbRes = await fetch(`${config.API_URL}/api/leaderboard?type=${type}`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (lbRes.ok) {
        const lbData = await lbRes.json();
        setLeaderboard(lbData);
      }
    } catch (e) {
      console.error("Failed to fetch leaderboard", e);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      const email = localStorage.getItem('userEmail');
      const isGuest = localStorage.getItem('isGuest') === 'true';
      console.log("ProgressPage fetchData check:", { email, isGuest });
      if (!email || isGuest) {
        if (isGuest) console.log("Guest mode detected in Progress page, skipping API fetch.");
        setLoading(false);
        return;
      }

      try {
        // Fetch User Stats
        const statsRes = await fetch(`${config.API_URL}/api/progress/${email}`, {
          headers: {
            "ngrok-skip-browser-warning": "true"
          }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            gamesPlayed: statsData.gamesPlayed || 0,
            articlesRead: statsData.articlesRead || 0,
            totalPoints: statsData.totalPoints || 0,
            mastery: statsData.mastery || { executive: 0, legislature: 0, judiciary: 0 },
            pointsBreakdown: statsData.pointsBreakdown ? {
              articleMatch: statsData.pointsBreakdown.articleMatch || 0,
              rightsDutiesClimb: statsData.pointsBreakdown.rightsDutiesClimb || 0,
              constitutionCards: statsData.pointsBreakdown.constitutionCards || 0,
              chakra: statsData.pointsBreakdown.chakra || 0,
              learn: statsData.pointsBreakdown.learn || 0,
              quiz: statsData.pointsBreakdown.quiz || 0,
              sort: statsData.pointsBreakdown.sort || 0,
              timeline: statsData.pointsBreakdown.timeline || 0,
              crossroads: statsData.pointsBreakdown.crossroads || 0,
              justiceJury: statsData.pointsBreakdown.justiceJury || 0,
              reverseHangman: statsData.pointsBreakdown.reverseHangman || 0,
            } : {
              articleMatch: 0,
              rightsDutiesClimb: 0,
              constitutionCards: 0,
              chakra: 0,
              learn: 0,
              quiz: 0,
              sort: 0,
              timeline: 0,
              crossroads: 0,
              justiceJury: 0,
              reverseHangman: 0,
            }
          });
        }
      } catch (e) {
        console.error("Failed to fetch progress data", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isSupremeChampion = stats.articlesRead >= 10 && stats.totalPoints >= 100 && stats.mastery.executive >= 100 && stats.mastery.legislature >= 100 && stats.mastery.judiciary >= 100;

  useEffect(() => {
    if (isSupremeChampion) {
      const hasSeenCelebration = localStorage.getItem('hasSeenBadgeCelebration');
      if (!hasSeenCelebration) {
        setShowBadgeCelebration(true);
        localStorage.setItem('hasSeenBadgeCelebration', 'true');
      }
    }
  }, [isSupremeChampion]);

  function handleStartPlaying() {
    navigate('/games');
  }

  const getScoreByType = (user, type) => {
    if (type === 'overall') return user.totalPoints;
    return user.pointsBreakdown?.[type] || 0;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-screen">
          <div className="spinner"></div>
          <p><TranslatedText>Loading your journey...</TranslatedText></p>
        </div>
      </>
    );
  }

  return (
    <>
      <section className="sectionProgress">
        <Navbar />
      </section>
      <main className="pa-wrapper">
        {localStorage.getItem('isGuest') === 'true' && (
          <div className="guest-restriction-overlay animated fadeIn">
            <div className="glossy-card-guest">
              <span className="lock-icon-guest">🔒</span>
              <h2><TranslatedText>{t.login.guestRestrictedTitle || "Access Restricted"}</TranslatedText></h2>
              <p><TranslatedText>{t.login.guestRestrictedMsg || "Please login to view your personal progress and achievements."}</TranslatedText></p>
              <button className="login-redirect-btn" onClick={() => { localStorage.clear(); window.location.href = '/'; }}>
                <TranslatedText>{t.login.login || "Login Now"}</TranslatedText>
              </button>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="pa-header reveal-up stagger-1">
          <span className="pa-pill"><TranslatedText>{t.progress.journey}</TranslatedText></span>
          <h1><TranslatedText>{t.progress.title}</TranslatedText></h1>
          <p><TranslatedText>{t.progress.subtitle}</TranslatedText></p>
        </div>

        <div className="pa-container">
          {/* Supreme Champion Badge */}
          {isSupremeChampion && (
            <section className="pa-card supreme-badge-card animated pulse-glow">
              <div className="badge-visual">
                <div className="badge-glow"></div>
                <span className="badge-emoji">🏅</span>
              </div>
              <div className="badge-content">
                <span className="badge-label"><TranslatedText>{t.progress.constitutionBadge}</TranslatedText></span>
                <h2><TranslatedText>{t.progress.supremeChampion}</TranslatedText></h2>
                <p><TranslatedText>{t.progress.supremeChampionDesc}</TranslatedText></p>
              </div>
            </section>
          )}

          {/* Overall Progress */}
          <section className="pa-card gradient-border reveal-up stagger-2">
            <div className="card-top-gradient"></div>

            <h2 className="section-title"><TranslatedText>{t.progress.overall}</TranslatedText></h2>

            <div className="stats-grid">
              <div className="stat-box blue">
                <h3>{stats.gamesPlayed}</h3>
                <span><TranslatedText>{t.progress.gamesPlayed}</TranslatedText></span>
              </div>
              <div className="stat-box orange">
                <h3>{stats.articlesRead}</h3>
                <span><TranslatedText>{t.progress.articlesRead}</TranslatedText></span>
              </div>
              <div className="stat-box green clickable" onClick={() => setShowSummary(true)}>
                <h3>{stats.totalPoints}</h3>
                <span><TranslatedText>{t.progress.totalPoints}</TranslatedText></span>
                <span className="tap-hint"><TranslatedText>Click for details</TranslatedText></span>
              </div>
            </div>

            <div className="cta-box">
              <p><TranslatedText>{t.progress.cta}</TranslatedText></p>
              <button className="primary-btn" onClick={handleStartPlaying}><TranslatedText>{t.progress.startPlaying}</TranslatedText></button>
            </div>
          </section>

          {/* Leaderboard Section */}
          <section className="pa-card leaderboard-section reveal-up stagger-3">
            <div className="leaderboard-header">
              <div className="header-title">
                <span className="trophy-icon">🏆</span>
                <h2><TranslatedText>Leaderboard</TranslatedText></h2>
              </div>
            </div>

            <div className="leaderboard-tabs-wrapper">
              <div className="leaderboard-tabs">
                {leaderboardTabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label"><TranslatedText>{tab.label}</TranslatedText></span>
                  </button>
                ))}
              </div>
            </div>
            <div className="leaderboard-overflow">
              <div className="leaderboard-list">
                {leaderboardLoading ? (
                  <div className="leaderboard-loader">
                    <div className="spinner mini"></div>
                    <p><TranslatedText>Loading...</TranslatedText></p>
                  </div>
                ) : (
                  <>
                    {leaderboard.map((user, index) => {
                      const rank = index + 1;
                      const score = getScoreByType(user, activeTab);
                      const isMe = user.name === localStorage.getItem('userName');
                      const date = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Jan 19';

                      return (

                        <div key={index} className={`leaderboard-item rank-${rank} ${isMe ? 'is-me' : ''}`}>
                          <div className="item-rank-icon">
                            {rank === 1 ? <span className="rank-emoji crown">🥇</span> : rank === 2 ? <span className="rank-emoji medal">🥈</span> : rank === 3 ? <span className="rank-emoji medal">🥉</span> : <span className="rank-emoji medal">🎖️</span>}
                          </div>
                          <div className="item-user-info">
                            <div className="user-avatar">
                              <span className="user-icon">👤</span>
                            </div>
                            <div className="user-details">
                              <span className="user-name"><TranslatedText>{user.name}</TranslatedText></span>
                              <span className="item-date"><TranslatedText>{date}</TranslatedText></span>
                            </div>
                          </div>
                          <div className="item-score-pill">
                            {score} <TranslatedText>pts</TranslatedText>
                          </div>
                        </div>

                      );
                    })}
                    {leaderboard.length === 0 && (
                      <div className="no-entries"><TranslatedText>No entries yet for this category.</TranslatedText></div>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Category Mastery */}
          <section className="pa-card reveal-up stagger-4">
            <h2 className="section-title"><TranslatedText>{t.progress.mastery}</TranslatedText></h2>

            <div className="progress-item">
              <div className="progress-label">
                <span>🏛️ <TranslatedText>{t.learn.filters.executive}</TranslatedText></span>
                <span>{Math.min(stats.mastery.executive, 100)}%</span>
              </div>
              <div className="progress-bar">
                <div style={{ width: `${Math.min(stats.mastery.executive, 100)}%` }}></div>
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-label">
                <span>📜 <TranslatedText>{t.learn.filters.legislature}</TranslatedText></span>
                <span>{Math.min(stats.mastery.legislature, 100)}%</span>
              </div>
              <div className="progress-bar">
                <div style={{ width: `${Math.min(stats.mastery.legislature, 100)}%` }}></div>
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-label">
                <span>⚖️ <TranslatedText>{t.learn.filters.judiciary}</TranslatedText></span>
                <span>{Math.min(stats.mastery.judiciary, 100)}%</span>
              </div>
              <div className="progress-bar">
                <div style={{ width: `${Math.min(stats.mastery.judiciary, 100)}%` }}></div>
              </div>
            </div>
          </section>

          {/* Achievements */}
          <section className="pa-card reveal-up stagger-5">
            <h2 className="section-title"><TranslatedText>{t.progress.achievements}</TranslatedText></h2>

            <div className="achievements-grid">
              <div className={`achievement ${stats.pointsBreakdown.chakra > 0 ? 'unlocked' : 'locked'}`}>
                <span className="emoji">🎡</span>
                <h4><TranslatedText>{t.progress.firstSpin}</TranslatedText></h4>
                <p><TranslatedText>{t.progress.completeSpin}</TranslatedText></p>
                {stats.pointsBreakdown.chakra === 0 && <span className="lock">🔒</span>}
              </div>

              <div className={`achievement ${stats.totalPoints >= 100 ? 'unlocked' : 'locked'}`}>
                <span className="emoji">🏆</span>
                <h4><TranslatedText>{t.progress.quizMaster}</TranslatedText></h4>
                <p><TranslatedText>{t.progress.score100}</TranslatedText></p>
                {stats.totalPoints < 100 && <span className="lock">🔒</span>}
              </div>

              <div className={`achievement ${stats.articlesRead >= 10 ? 'unlocked' : 'locked'}`}>
                <span className="emoji">📚</span>
                <h4><TranslatedText>{t.progress.articleExplorer}</TranslatedText></h4>
                <p><TranslatedText>{t.progress.read10}</TranslatedText></p>
                {stats.articlesRead < 10 && <span className="lock">🔒</span>}
              </div>

              <div className={`achievement ${stats.mastery.legislature >= 100 ? 'unlocked' : 'locked'}`}>
                <span className="emoji">📜</span>
                <h4><TranslatedText>{t.progress.legislatureExpert}</TranslatedText></h4>
                <p><TranslatedText>{t.progress.masterLeg}</TranslatedText></p>
                {stats.mastery.legislature < 100 && <span className="lock">🔒</span>}
              </div>

              <div className={`achievement ${stats.mastery.executive >= 100 ? 'unlocked' : 'locked'}`}>
                <span className="emoji">🏛️</span>
                <h4><TranslatedText>{t.progress.executiveExpert}</TranslatedText></h4>
                <p><TranslatedText>{t.progress.masterExec}</TranslatedText></p>
                {stats.mastery.executive < 100 && <span className="lock">🔒</span>}
              </div>

              <div className={`achievement ${stats.mastery.judiciary >= 100 ? 'unlocked' : 'locked'}`}>
                <span className="emoji">⚖️</span>
                <h4><TranslatedText>{t.progress.judiciaryExpert}</TranslatedText></h4>
                <p><TranslatedText>{t.progress.masterJud}</TranslatedText></p>
                {stats.mastery.judiciary < 100 && <span className="lock">🔒</span>}
              </div>
            </div>
          </section>
        </div>

        {/* Points Summary Modal */}
        {showSummary && (
          <div className="summary-modal-overlay" onClick={() => setShowSummary(false)}>
            <div className="summary-modal" onClick={e => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setShowSummary(false)}>&times;</button>
              <h2 className="modal-title">📊 <TranslatedText>Points Breakdown</TranslatedText></h2>
              <div className="list-box">
                <div className="summary-list">
                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-icon">📚</span>
                      <div>
                        <h4><TranslatedText>{t.learn.title}</TranslatedText></h4>
                        <p><TranslatedText>Articles Read Progress</TranslatedText></p>
                      </div>
                    </div>
                    <span className="item-points">+{stats.pointsBreakdown.learn}</span>
                  </div>

                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-icon">🧩</span>
                      <div>
                        <h4><TranslatedText>{t.home.gameFormats.games.match.title}</TranslatedText></h4>
                        <p><TranslatedText>Article Match Challenge</TranslatedText></p>
                      </div>
                    </div>
                    <span className="item-points">+{stats.pointsBreakdown.articleMatch}</span>
                  </div>

                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-icon">🐍</span>
                      <div>
                        <h4><TranslatedText>{t.home.gameFormats.games.climb.title}</TranslatedText></h4>
                        <p><TranslatedText>Snakes & Ladders Quiz</TranslatedText></p>
                      </div>
                    </div>
                    <span className="item-points">+{stats.pointsBreakdown.rightsDutiesClimb}</span>
                  </div>

                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-icon">🎴</span>
                      <div>
                        <h4><TranslatedText>{t.home.gameFormats.games.cards.title}</TranslatedText></h4>
                        <p><TranslatedText>Constitutional Flashcards</TranslatedText></p>
                      </div>
                    </div>
                    <span className="item-points">+{stats.pointsBreakdown.constitutionCards}</span>
                  </div>

                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-icon">🎡</span>
                      <div>
                        <h4><TranslatedText>{t.home.gameFormats.games.wheel.title}</TranslatedText></h4>
                        <p><TranslatedText>Chakra of Knowledge</TranslatedText></p>
                      </div>
                    </div>
                    <span className="item-points">+{stats.pointsBreakdown.chakra}</span>
                  </div>

                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-icon">🧠</span>
                      <div>
                        <h4><TranslatedText>Constitutional Quiz</TranslatedText></h4>
                        <p><TranslatedText>Quiz Challenges</TranslatedText></p>
                      </div>
                    </div>
                    <span className="item-points">+{stats.pointsBreakdown.quiz}</span>
                  </div>

                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-icon">⫽</span>
                      <div>
                        <h4><TranslatedText>{t.constitutionalSort.title}</TranslatedText></h4>
                        <p><TranslatedText>Sorting Challenge</TranslatedText></p>
                      </div>
                    </div>
                    <span className="item-points">+{stats.pointsBreakdown.sort}</span>
                  </div>


                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-icon">⚖️</span>
                      <div>
                        <h4><TranslatedText>{t.constitutionalCrossroads.title}</TranslatedText></h4>
                        <p><TranslatedText>Constitutional Crossroads</TranslatedText></p>
                      </div>
                    </div>
                    <span className="item-points">+{stats.pointsBreakdown.crossroads}</span>
                  </div>

                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-icon">👨‍⚖️</span>
                      <div>
                        <h4><TranslatedText>{t.justiceJury.title}</TranslatedText></h4>
                        <p><TranslatedText>Justice Jury - Constitutional Judge</TranslatedText></p>
                      </div>
                    </div>
                    <span className="item-points">+{stats.pointsBreakdown.justiceJury}</span>
                  </div>

                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-icon">🛡️</span>
                      <div>
                        <h4><TranslatedText>{t.reverseHangman.title}</TranslatedText></h4>
                        <p><TranslatedText>{t.reverseHangman.descp}</TranslatedText></p>
                      </div>
                    </div>
                    <span className="item-points">+{stats.pointsBreakdown.reverseHangman}</span>
                  </div>

                </div>
              </div>
              <div className="modal-footer">
                <div className="total-row">
                  <span><TranslatedText>Total Accumulated</TranslatedText></span>
                  <span className="total-val">{stats.totalPoints} <TranslatedText>pts</TranslatedText></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Badge Celebration Modal */}
        {showBadgeCelebration && (
          <div className="celebration-overlay" onClick={() => setShowBadgeCelebration(false)}>
            <div className="celebration-card" onClick={e => e.stopPropagation()}>
              <div className="confetti-container">
                {/* Confetti elements will be styled in CSS */}
                {[...Array(12)].map((_, i) => <div key={i} className={`confetti c${i}`}></div>)}
              </div>
              <div className="badge-reveal">
                <div className="reveal-glow"></div>
                <span className="massive-badge">🏅</span>
              </div>
              <h2><TranslatedText>{t.progress.wellDone}</TranslatedText>!</h2>
              <h3><TranslatedText>{t.progress.supremeChampion}</TranslatedText> <TranslatedText>Unlocked</TranslatedText></h3>
              <p><TranslatedText>{t.progress.supremeChampionDesc}</TranslatedText></p>
              <button className="celebrate-btn" onClick={() => setShowBadgeCelebration(false)}><TranslatedText>AWESOME!</TranslatedText></button>
            </div>
          </div>
        )}
      </main>
      <section>
        <Footer />
      </section>
    </>
  );
};

export default ProgressPage;
