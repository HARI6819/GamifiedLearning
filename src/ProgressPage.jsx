import React, { useState, useEffect } from "react";
import "./ProgressPage.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLanguage } from "./context/LanguageContext";
import { useNavigate } from "react-router";
import config from "./config";

const ProgressPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
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
      crossroads: 0
    }
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeTab, setActiveTab] = useState('overall');

  const leaderboardTabs = [
    { id: 'overall', label: 'Overall', icon: '🏆' },
    { id: 'quiz', label: t.home.gameFormats.games.quiz.title, icon: '🃏' },
    { id: 'constitutionCards', label: t.home.gameFormats.games.cards.title, icon: '📚' },
    { id: 'articleMatch', label: t.home.gameFormats.games.match.title, icon: '🧠' },
    { id: 'rightsDutiesClimb', label: t.home.gameFormats.games.climb.title, icon: '🎲' },
    { id: 'chakra', label: t.home.gameFormats.games.wheel.title, icon: '🎡' },
    { id: 'sort', label: t.constitutionalSort.title, icon: '⫽' },
    { id: 'crossroads', label: t.constitutionalCrossroads.title, icon: '🧩' },
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

  function handleStartPlaying() {
    navigate('/games');
  }

  const getScoreByType = (user, type) => {
    if (type === 'overall') return user.totalPoints;
    return user.pointsBreakdown?.[type] || 0;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your journey...</p>
      </div>
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
              <h2>{t.login.guestRestrictedTitle || "Access Restricted"}</h2>
              <p>{t.login.guestRestrictedMsg || "Please login to view your personal progress and achievements."}</p>
              <button className="login-redirect-btn" onClick={() => { localStorage.clear(); window.location.href = '/'; }}>
                {t.login.login || "Login Now"}
              </button>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="pa-header">
          <span className="pa-pill">{t.progress.journey}</span>
          <h1>{t.progress.title}</h1>
          <p>{t.progress.subtitle}</p>
        </div>

        <div className="pa-container">
          {/* Overall Progress */}
          <section className="pa-card gradient-border">
            <div className="card-top-gradient"></div>

            <h2 className="section-title">{t.progress.overall}</h2>

            <div className="stats-grid">
              <div className="stat-box blue">
                <h3>{stats.gamesPlayed}</h3>
                <span>{t.progress.gamesPlayed}</span>
              </div>
              <div className="stat-box orange">
                <h3>{stats.articlesRead}</h3>
                <span>{t.progress.articlesRead}</span>
              </div>
              <div className="stat-box green clickable" onClick={() => setShowSummary(true)}>
                <h3>{stats.totalPoints}</h3>
                <span>{t.progress.totalPoints}</span>
                <span className="tap-hint">Click for details</span>
              </div>
            </div>

            <div className="cta-box">
              <p>{t.progress.cta}</p>
              <button className="primary-btn" onClick={handleStartPlaying}>{t.progress.startPlaying}</button>
            </div>
          </section>

          {/* Leaderboard Section */}
          <section className="pa-card leaderboard-section">
            <div className="leaderboard-header">
              <div className="header-title">
                <span className="trophy-icon">🏆</span>
                <h2>Leaderboard</h2>
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
                    <span className="tab-label">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="leaderboard-overflow">
              <div className="leaderboard-list">
                {leaderboardLoading ? (
                  <div className="leaderboard-loader">
                    <div className="spinner mini"></div>
                    <p>Loading...</p>
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
                              <span className="user-name">{user.name}</span>
                              <span className="item-date">{date}</span>
                            </div>
                          </div>
                          <div className="item-score-pill">
                            {score} pts
                          </div>
                        </div>

                      );
                    })}
                    {leaderboard.length === 0 && (
                      <div className="no-entries">No entries yet for this category.</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Category Mastery */}
          <section className="pa-card">
            <h2 className="section-title">{t.progress.mastery}</h2>

            <div className="progress-item">
              <div className="progress-label">
                <span>🏛️ {t.learn.filters.executive}</span>
                <span>{Math.min(stats.mastery.executive, 100)}%</span>
              </div>
              <div className="progress-bar">
                <div style={{ width: `${Math.min(stats.mastery.executive, 100)}%` }}></div>
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-label">
                <span>📜 {t.learn.filters.legislature}</span>
                <span>{Math.min(stats.mastery.legislature, 100)}%</span>
              </div>
              <div className="progress-bar">
                <div style={{ width: `${Math.min(stats.mastery.legislature, 100)}%` }}></div>
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-label">
                <span>⚖️ {t.learn.filters.judiciary}</span>
                <span>{Math.min(stats.mastery.judiciary, 100)}%</span>
              </div>
              <div className="progress-bar">
                <div style={{ width: `${Math.min(stats.mastery.judiciary, 100)}%` }}></div>
              </div>
            </div>
          </section>

          {/* Achievements */}
          <section className="pa-card">
            <h2 className="section-title">{t.progress.achievements}</h2>

            <div className="achievements-grid">
              <div className={`achievement ${stats.articlesRead > 0 ? 'unlocked' : 'locked'}`}>
                <span className="emoji">🎡</span>
                <h4>{t.progress.firstSpin}</h4>
                <p>{t.progress.completeSpin}</p>
                {stats.articlesRead === 0 && <span className="lock">🔒</span>}
              </div>

              <div className={`achievement ${stats.totalPoints >= 100 ? 'unlocked' : 'locked'}`}>
                <span className="emoji">🏆</span>
                <h4>{t.progress.quizMaster}</h4>
                <p>{t.progress.score100}</p>
                {stats.totalPoints < 100 && <span className="lock">🔒</span>}
              </div>

              <div className={`achievement ${stats.articlesRead >= 10 ? 'unlocked' : 'locked'}`}>
                <span className="emoji">📚</span>
                <h4>{t.progress.articleExplorer}</h4>
                <p>{t.progress.read10}</p>
                {stats.articlesRead < 10 && <span className="lock">🔒</span>}
              </div>

              <div className={`achievement ${stats.mastery.legislature >= 100 ? 'unlocked' : 'locked'}`}>
                <span className="emoji">📜</span>
                <h4>{t.progress.legislatureExpert}</h4>
                <p>{t.progress.masterLeg}</p>
                {stats.mastery.legislature < 100 && <span className="lock">🔒</span>}
              </div>

              <div className={`achievement ${stats.mastery.executive >= 100 ? 'unlocked' : 'locked'}`}>
                <span className="emoji">🏛️</span>
                <h4>{t.progress.executiveExpert}</h4>
                <p>{t.progress.masterExec}</p>
                {stats.mastery.executive < 100 && <span className="lock">🔒</span>}
              </div>

              <div className={`achievement ${stats.mastery.judiciary >= 100 ? 'unlocked' : 'locked'}`}>
                <span className="emoji">⚖️</span>
                <h4>{t.progress.judiciaryExpert}</h4>
                <p>{t.progress.masterJud}</p>
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
              <h2 className="modal-title">📊 Points Breakdown</h2>
              <div className="list-box">
                <div className="summary-list">
                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-icon">📚</span>
                      <div>
                        <h4>{t.learn.title}</h4>
                        <p>Articles Read Progress</p>
                      </div>
                    </div>
                    <span className="item-points">+{stats.pointsBreakdown.learn}</span>
                  </div>

                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-icon">🧩</span>
                      <div>
                        <h4>{t.home.gameFormats.games.match.title}</h4>
                        <p>Article Match Challenge</p>
                      </div>
                    </div>
                    <span className="item-points">+{stats.pointsBreakdown.articleMatch}</span>
                  </div>

                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-icon">🐍</span>
                      <div>
                        <h4>{t.home.gameFormats.games.climb.title}</h4>
                        <p>Snakes & Ladders Quiz</p>
                      </div>
                    </div>
                    <span className="item-points">+{stats.pointsBreakdown.rightsDutiesClimb}</span>
                  </div>

                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-icon">🎴</span>
                      <div>
                        <h4>{t.home.gameFormats.games.cards.title}</h4>
                        <p>Constitutional Flashcards</p>
                      </div>
                    </div>
                    <span className="item-points">+{stats.pointsBreakdown.constitutionCards}</span>
                  </div>

                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-icon">🎡</span>
                      <div>
                        <h4>{t.home.gameFormats.games.wheel.title}</h4>
                        <p>Chakra of Knowledge</p>
                      </div>
                    </div>
                    <span className="item-points">+{stats.pointsBreakdown.chakra}</span>
                  </div>

                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-icon">🧠</span>
                      <div>
                        <h4>Constitutional Quiz</h4>
                        <p>Quiz Challenges</p>
                      </div>
                    </div>
                    <span className="item-points">+{stats.pointsBreakdown.quiz}</span>
                  </div>

                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-icon">⫽</span>
                      <div>
                        <h4>{t.constitutionalSort.title}</h4>
                        <p>Sorting Challenge</p>
                      </div>
                    </div>
                    <span className="item-points">+{stats.pointsBreakdown.sort}</span>
                  </div>


                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-icon">⚖️</span>
                      <div>
                        <h4>{t.constitutionalCrossroads.title}</h4>
                        <p>Constitutional Crossroads</p>
                      </div>
                    </div>
                    <span className="item-points">+{stats.pointsBreakdown.crossroads}</span>
                  </div>


                </div>
              </div>
              <div className="modal-footer">
                <div className="total-row">
                  <span>Total Accumulated</span>
                  <span className="total-val">{stats.totalPoints} pts</span>
                </div>
              </div>
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
