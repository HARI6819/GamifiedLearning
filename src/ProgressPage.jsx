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
      learn: 0
    }
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const email = localStorage.getItem('userEmail');
      if (!email) {
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
            pointsBreakdown: statsData.pointsBreakdown || {
              articleMatch: 0,
              rightsDutiesClimb: 0,
              constitutionCards: 0,
              chakra: 0,
              learn: 0
            }
          });
        }

        // Fetch Leaderboard
        const lbRes = await fetch(`${config.API_URL}/api/leaderboard`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "ngrok-skip-browser-warning": "true"
          }
        }
        );

        console.log("Status:", lbRes.status);
        console.log("Redirected:", lbRes.redirected);
        console.log("Content-Type:", lbRes.headers.get("content-type"));

        const raw = await lbRes.text();
        console.log("RAW RESPONSE:", raw);

        const lbData = JSON.parse(raw);
        setLeaderboard(lbData);

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
          <section className="pa-card">
            <h2 className="section-title">🏆 Leaderboard</h2>
            <div className="leaderboard-table-container">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, index) => (
                    <tr key={index} className={user.name === localStorage.getItem('userName') ? 'highlight-me' : ''}>
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.totalPoints}</td>
                    </tr>
                  ))}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No entries yet. Be the first!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Category Mastery */}
          <section className="pa-card">
            <h2 className="section-title">{t.progress.mastery}</h2>

            <div className="progress-item">
              <div className="progress-label">
                <span>🏛️ {t.learn.filters.executive}</span>
                <span>{stats.mastery.executive}%</span>
              </div>
              <div className="progress-bar">
                <div style={{ width: `${Math.min(stats.mastery.executive, 100)}%` }}></div>
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-label">
                <span>📜 {t.learn.filters.legislature}</span>
                <span>{stats.mastery.legislature}%</span>
              </div>
              <div className="progress-bar">
                <div style={{ width: `${Math.min(stats.mastery.legislature, 100)}%` }}></div>
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-label">
                <span>⚖️ {t.learn.filters.judiciary}</span>
                <span>{stats.mastery.judiciary}%</span>
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
