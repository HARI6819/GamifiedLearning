import React, { useState, useEffect } from "react";
import "./RightsDutiesClimb.css";
import questions from "./data/arti.json";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Dices, RotateCcw, Lock, LockOpen, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

import { useLanguage } from "./context/LanguageContext";
import config from "./config";


const ladders = {
  4: 13,
  17: 38,
  43: 64,
  56: 75,
  47: 78
};


const snakes = {
  32: 12,
  36: 15,
  49: 30,
  62: 41,
  86: 67,
  95: 72,
  99: 60
};

const DiceIcon = ({ num }) => {
  switch (num) {
    case 1: return <Dice1 size={48} color="currentColor" strokeWidth={1.5} />;
    case 2: return <Dice2 size={48} color="currentColor" strokeWidth={1.5} />;
    case 3: return <Dice3 size={48} color="currentColor" strokeWidth={1.5} />;
    case 4: return <Dice4 size={48} color="currentColor" strokeWidth={1.5} />;
    case 5: return <Dice5 size={48} color="currentColor" strokeWidth={1.5} />;
    case 6: return <Dice6 size={48} color="currentColor" strokeWidth={1.5} />;
    default: return <Dice1 size={48} color="currentColor" strokeWidth={1.5} />;
  }
};

export default function RightsDutiesClimb() {
  const { t } = useLanguage();
  const [position, setPosition] = useState(1);
  const [dice, setDice] = useState(0);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState("");
  const [popup, setPopup] = useState({ show: false, title: "", message: "", type: "" });

  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQ, setCurrentQ] = useState(null);
  const [Number, setNumber] = useState(1);
  const [IsActiveDice, setIsActiveDice] = useState(false);
  const [difficulty, setDifficulty] = useState("Easy");
  const [unlockedLevels, setUnlockedLevels] = useState(["Easy"]);

  useEffect(() => {
    const fetchProgress = async () => {
      const email = localStorage.getItem('userEmail');
      const isGuest = localStorage.getItem('isGuest') === 'true';
      if (!email || isGuest) return;
      try {
        const res = await fetch(`${config.API_URL}/api/progress/${email}`, {
          headers: { "ngrok-skip-browser-warning": "true" }
        });
        if (res.ok) {
          const data = await res.json();
          const allGames = ["articleMatch", "rightsDutiesClimb", "constitutionCards", "chakra", "quiz", "sort"];
          const completed = data.completedLevels || {};
          const levels = ["Easy"];
          if (allGames.every(g => completed[g]?.includes("Easy"))) levels.push("Medium");
          if (allGames.every(g => completed[g]?.includes("Medium"))) levels.push("Hard");
          setUnlockedLevels(levels);
        }
      } catch (e) {
        console.error("Failed to fetch progress", e);
      }
    };
    fetchProgress();
  }, []);

  const rollDice = () => {
    setIsActiveDice(true);
    let shuffleRoll = 1;

    // 1. Shuffle Animation
    const shuffleId = setInterval(() => {
      shuffleRoll = Math.floor(Math.random() * 6) + 1;
      setNumber(shuffleRoll); // Update visual dice
    }, 100);

    // 2. Stop Shuffling and determine final value
    setTimeout(() => {
      clearInterval(shuffleId);

      const finalRoll = Math.floor(Math.random() * 6) + 1;
      setNumber(finalRoll); // Show final dice face

      // Check if move is valid (exact 100 rule)
      if (position + finalRoll > 100) {
        setDice(finalRoll);
        setMessage(`⚠️ Rolled ${finalRoll}. Need exact number to finish!`);
        setIsActiveDice(false);
        return; // Don't show question, just wait for next roll
      }

      // 3. Delay before showing question
      setTimeout(() => {
        setIsActiveDice(false);
        // Filter questions by difficulty
        const diffQuestions = questions.filter(q => q.difficulty === difficulty);
        const pool = diffQuestions.length > 0 ? diffQuestions : questions;
        const randomQ = pool[Math.floor(Math.random() * pool.length)];

        setDice(finalRoll);
        setCurrentQ(randomQ);
        setShowQuestion(true);
        setMessage("");
      }, 1000); // 1 second delay to see the dice result

    }, 2000); // Shuffle for 2 seconds
  };

  /* Helper to get coordinates for any board number (1-100) */
  const getCoords = (num) => {
    const i = 100 - num;
    const x = (i % 10) * 10 + 5;
    const y = Math.floor(i / 10) * 10 + 5;
    return { x, y };
  };

  const handleAnswer = (index) => {
    let newPos = position;

    if (index === currentQ.correctIndex) {
      if (position + dice > 100) {
        setMessage(`⚠️ Correct, but rolled ${dice}. Need exact to finish!`);
        newPos = position;
      } else {
        newPos += dice;
        setMessage(`✅ Correct! +${dice} steps`);
      }
    } else {
      const penalty = Math.floor(dice / 2);
      newPos -= penalty;
      setMessage(`❌ Wrong! -${penalty} steps`);
    }

    updateProgress(index === currentQ.correctIndex ? currentQ.points : 0);

    // Bounds check
    if (newPos < 1) newPos = 1;
    if (newPos > 100) newPos = 100;

    // 1. Move to the target square immediately (triggers transition)
    setPosition(newPos);
    setMoves((m) => m + 1);
    setShowQuestion(false);

    // 2. Check for Snakes/Ladders after a short delay (to let player arrive first)
    setTimeout(() => {
      if (ladders[newPos]) {
        setPopup({ show: true, title: "🪜 Ladder!", message: "Great progress! Climbing up...", type: "ladder" });
        setMessage("🪜 Ladder! Climbing up...");
        setPosition(ladders[newPos]);
        setTimeout(() => setPopup(prev => ({ ...prev, show: false })), 2000);
      } else if (snakes[newPos]) {
        setPopup({ show: true, title: "🐍 Snake!", message: "Oops! Sliding down...", type: "snake" });
        setMessage("🐍 Snake! Sliding down...");
        setPosition(snakes[newPos]);
        setTimeout(() => setPopup(prev => ({ ...prev, show: false })), 2000);
      } else if (newPos === 100) {
        setPopup({ show: true, title: "🏆 Winner!", message: "Congratulations! You completed the game!", type: "win" });
        updateCompletion();
      }
    }, 800); // 800ms delay for smooth arrival before next move
  };

  const updateCompletion = async () => {
    const email = localStorage.getItem('userEmail');
    const isGuest = localStorage.getItem('isGuest') === 'true';
    if (!email || isGuest) return;
    try {
      await fetch(`${config.API_URL}/api/progress/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({
          email,
          gamesPlayed: 1,
          totalPoints: difficulty === "Hard" ? 100 : (difficulty === "Medium" ? 60 : 30),
          gameId: "rightsDutiesClimb",
          completedLevel: difficulty,
          mastery: { legislature: 10, executive: 10, judiciary: 10 }
        })
      });
    } catch (e) {
      console.error("Failed to update progress", e);
    }
  };

  const updateProgress = async (points) => {
    if (points <= 0) return;
    const email = localStorage.getItem('userEmail');
    const isGuest = localStorage.getItem('isGuest') === 'true';
    if (!email || isGuest) return;

    try {
      await fetch(`${config.API_URL}/api/progress/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({
          email,
          totalPoints: points,
          gameId: "rightsDutiesClimb",
          mastery: { legislature: 3, executive: 3, judiciary: 3 }
        })
      });
    } catch (e) {
      console.error("Failed to update progress", e);
    }
  };

  const resetGame = () => {
    setPosition(1);
    setMoves(0);
    setDice(0);
    setMessage("");
    setShowQuestion(false);
  };

  function handleBack() {
    window.history.back();
  }

  // Calculate player position style
  const playerCoords = getCoords(position);

  return (
    <>
      <section className="section1">
        <Navbar />
      </section>
      <main className="game-container">
        <header className="game-header">
          <button className="back-btn" onClick={handleBack}>←</button>
          <div>
            <h1>{t.climb.title}</h1>
            <p>{t.climb.desc}</p>
          </div>
        </header>

        <div className="game-layout">
          {/* BOARD */}
          <div className="boardouter">
            <div className="BoardInfo">
              <div className="lup">
                <p className="upside"></p>
                <p>Ladder (Climb up)</p>
              </div>
              <div className="ldown">
                <p className="downside"></p>
                <p>Snake (Slide down)</p>
              </div>

              <p><span>🧑</span> You</p>
            </div>
            <div className="board">
              {/* Player Token (Absolute Positioned for Smooth Animation) */}
              <div
                className="player-token"
                style={{
                  left: `${playerCoords.x}%`,
                  top: `${playerCoords.y}%`
                }}
              >
                🧑
              </div>
              <svg className="board-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="rgba(0,0,0,0.3)" />
                  </filter>
                </defs>

                {/* Ladders */}
                {Object.entries(ladders).map(([start, end], index) => {
                  const s = parseInt(start);
                  const e = parseInt(end);

                  // Coordinates

                  const p1 = getCoords(s); // Bottom (Start)
                  const p2 = getCoords(e); // Top (End)

                  // Angle for rails
                  const dx = p2.x - p1.x;
                  const dy = p2.y - p1.y;
                  const angle = Math.atan2(dy, dx);
                  const length = Math.sqrt(dx * dx + dy * dy);

                  // Ladder Style (Wood, Red, Green, White)
                  const styles = [
                    { rail: "#854d0e", rung: "#a16207" }, // Wood
                    { rail: "#dc2626", rung: "#fca5a5" }, // Red
                    { rail: "#15803d", rung: "#86efac" }, // Green
                    { rail: "#475569", rung: "#cbd5e1" }, // Metal/White
                  ];
                  const style = styles[index % styles.length];
                  const width = 4; // Wider ladders

                  // Rail Offsets
                  const ox = Math.sin(angle) * (width / 2);
                  const oy = -Math.cos(angle) * (width / 2);

                  // Rungs
                  const rungCount = Math.floor(length / 5);
                  const rungs = [];
                  for (let i = 1; i < rungCount; i++) {
                    const t = i / rungCount;
                    const rx = p1.x + dx * t;
                    const ry = p1.y + dy * t;
                    rungs.push(
                      <line
                        key={i}
                        x1={rx - ox} y1={ry - oy}
                        x2={rx + ox} y2={ry + oy}
                        stroke={style.rung}
                        strokeWidth="1"
                        strokeLinecap="butt"
                      />
                    );
                  }

                  return (
                    <g key={`ladder-${s}`} filter="url(#shadow)">
                      {/* Rails */}
                      <line x1={p1.x - ox} y1={p1.y - oy} x2={p2.x - ox} y2={p2.y - oy} stroke={style.rail} strokeWidth="1" strokeLinecap="round" />
                      <line x1={p1.x + ox} y1={p1.y + oy} x2={p2.x + ox} y2={p2.y + oy} stroke={style.rail} strokeWidth="1" strokeLinecap="round" />
                      {/* Rungs */}
                      {rungs}
                    </g>
                  );
                })}

                {/* Snakes */}
                {Object.entries(snakes).map(([start, end], index) => {
                  const head = getCoords(start); // Start (Mouth/Head)
                  const tail = getCoords(end);   // End (Tail)

                  // Advanced Wavy Path Logic (Sine Wave)
                  const deltaX = tail.x - head.x;
                  const deltaY = tail.y - head.y;
                  const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                  const angle = Math.atan2(deltaY, deltaX);

                  // Calculate path string
                  let pathStr = `M ${head.x} ${head.y}`;
                  const steps = 30;
                  const amp = 4; // Amplitude of wave

                  for (let i = 1; i <= steps; i++) {
                    const t = i / steps;
                    // Base position on line
                    const bx = head.x + deltaX * t;
                    const by = head.y + deltaY * t;

                    // Oscillate perpendicular
                    const wavePhase = t * Math.PI * 2 * (dist / 20); // Frequency depends on length
                    const currentAmp = amp * Math.sin(wavePhase);

                    // Perpendicular direction
                    const px = -Math.sin(angle) * currentAmp;
                    const py = Math.cos(angle) * currentAmp;

                    // Taper amplitude at ends
                    const taper = Math.sin(t * Math.PI);

                    pathStr += ` L ${bx + px * taper} ${by + py * taper}`;
                  }

                  // Snake Colors
                  const snakeColors = [
                    { body: "#4ade80", stripe: "#15803d", head: "#166534" }, // Green Mamba
                    { body: "#f87171", stripe: "#991b1b", head: "#7f1d1d" }, // Coral Snake
                    { body: "#fbbf24", stripe: "#92400e", head: "#854d0e" }, // Python
                    { body: "#a855f7", stripe: "#581c87", head: "#4c1d95" }, // Viper
                  ];
                  const theme = snakeColors[index % snakeColors.length];

                  return (
                    <g key={`snake-${start}`} filter="url(#shadow)">
                      {/* Thick Body (Outline/Border) */}
                      <path d={pathStr} stroke={theme.stripe} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Main Body Color */}
                      <path d={pathStr} stroke={theme.body} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Pattern/Stripes */}
                      <path className="snake-body-pattern" d={pathStr} stroke={theme.stripe} strokeWidth="3" fill="none" strokeDasharray="1 4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />

                      {/* Head */}
                      <g transform={`translate(${head.x}, ${head.y}) rotate(${angle * 180 / Math.PI + 90})`}>
                        {/* More realistic head shape - Viper style */}
                        <path d="M -3.5 -1 C -4 -4, -2 -6, 0 -6 C 2 -6, 4 -4, 3.5 -1 C 3 2, 2 3, 0 3 C -2 3, -3 2, -3.5 -1 Z" fill={theme.head} stroke={theme.stripe} strokeWidth="0.5" />

                        {/* Eyes - Slit pupils for realism */}
                        <ellipse cx="-1.5" cy="-2.5" rx="1" ry="1.5" fill="#fbbf24" stroke="none" />
                        <ellipse cx="1.5" cy="-2.5" rx="1" ry="1.5" fill="#fbbf24" stroke="none" />
                        <ellipse cx="-1.5" cy="-2.5" rx="0.3" ry="1.2" fill="black" />
                        <ellipse cx="1.5" cy="-2.5" rx="0.3" ry="1.2" fill="black" />

                        {/* Nostrils */}
                        <circle cx="-0.8" cy="1.5" r="0.3" fill="black" opacity="0.5" />
                        <circle cx="0.8" cy="1.5" r="0.3" fill="black" opacity="0.5" />

                        {/* Tongue (Static & Small) */}
                        <path d="M 0 4 L 0 3.2 L -0.9 6.5 M 0 4 L 0.9 6.5" stroke="#ef4444" strokeWidth="0.8" fill="none" />
                      </g>
                    </g>
                  );
                })}
              </svg>

              {[...Array(100)].map((_, i) => {
                const num = 100 - i;
                return (
                  <div
                    key={num}
                    className={`cell
                  ${ladders[num] ? "ladder" : ""}
                  ${snakes[num] ? "snake" : ""}
                  ${position === num ? "player-cell" : ""}`}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIDE PANEL */}
          <aside className="panel">
            <div className="diff-selection" style={{ marginBottom: "20px", display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              {['Easy', 'Medium', 'Hard'].map((level) => {
                const isUnlocked = unlockedLevels.includes(level);
                return (
                  <button
                    key={level}
                    onClick={() => isUnlocked && setDifficulty(level)}
                    className={`diff-btn ${difficulty === level ? 'active' : ''}`}
                    disabled={!isUnlocked}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: "1px solid #ddd",
                      background: difficulty === level ? "#1e3a8a" : (isUnlocked ? "#fff" : "#f1f5f9"),
                      color: difficulty === level ? "#fff" : (isUnlocked ? "#1e3a8a" : "#94a3b8"),
                      cursor: isUnlocked ? "pointer" : "not-allowed",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px"
                    }}
                  >
                    {isUnlocked ? (
                      difficulty !== level && <LockOpen size={12} style={{ opacity: 0.7 }} />
                    ) : (
                      <Lock size={12} />
                    )}
                    {t.common.difficulty[level]}
                  </button>
                );
              })}
            </div>

            <div className="stats">
              <div>
                <h2 style={{ color: " #1e3a8a" }}>{position}</h2>
                <span>{t.climb.position}</span>
              </div>
              <div>
                <h2 style={{ color: " #EE860E" }}>{moves}</h2>
                <span>{t.climb.score}</span>
              </div>
              <div>
                <h2 style={{ color: " #51AA28" }}>{dice}</h2>
                <span>{t.climb.dice}</span>
              </div>
            </div>

            {!showQuestion && <div className="dice-box">
              <div className={`dice-display ${IsActiveDice ? "dicerotate" : ""}`} style={{ margin: "0 auto 10px", display: "flex", justifyContent: "center" }}>
                <DiceIcon num={Number} />
              </div>
              <button onClick={rollDice} disabled={showQuestion || IsActiveDice} className={`roll-btn ${IsActiveDice ? "rolling" : ""}`}>
                <Dices /> <h3>{IsActiveDice ? "Rolling..." : t.climb.roll}</h3>
              </button>
            </div>}

            {showQuestion && currentQ && (
              <div className="question-box">
                <h3>{currentQ.question}</h3>
                {currentQ.options.map((opt, i) => (
                  <button
                    key={i}
                    className="option"
                    onClick={() => handleAnswer(i)}
                  >
                    <div className="Qoptions"><h4>{String.fromCharCode(i + 65)}.</h4>{opt}</div>
                  </button>
                ))}
              </div>
            )}

            {message && <div className="messageBox">{message}</div>}

            <button className="reset" onClick={resetGame}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", fontSize: "15px" }}><RotateCcw /> {t.climb.reset}</div>
            </button>

            <div className="rules">
              <h4>{t.climb.howToPlay}</h4>
              <ul>
                {t.climb.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* Game Popups */}
        {popup.show && (
          <div className={`climb-popup-overlay animated fadeIn`}>
            {popup.type === 'win' ? (
              <div className="climb-completion-card">
                <div className="completion-icon">🏆</div>
                <h2>{language === 'hi' ? 'बधाई हो!' : 'Congratulations!'}</h2>
                <p>
                  {language === 'hi'
                    ? `आपने ${moves} चालों में खेल सफलतापूर्वक पूरा कर लिया है!`
                    : `You've successfully completed the game in ${moves} moves!`}
                </p>
                <div className="completion-stats">
                  <div className="stat-pill">
                    Position: 100
                  </div>
                  <div className="stat-pill">
                    Moves: {moves}
                  </div>
                </div>
                <button className="continue-btn-climb" onClick={() => { setPopup(prev => ({ ...prev, show: false })); resetGame(); }}>
                  <RotateCcw size={18} /> {language === 'hi' ? 'फिर से खेलें' : 'Play Again'}
                </button>
              </div>
            ) : (
              <div className={`climb-popup ${popup.type}`}>
                <h2>{popup.title}</h2>
                <p>{popup.message}</p>
                <div className="loader-line"></div>
              </div>
            )}
          </div>
        )}
      </main>
      <section>
        <Footer />
      </section>
    </>
  );
}
