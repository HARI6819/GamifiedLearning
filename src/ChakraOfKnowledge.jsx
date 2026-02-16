import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import articles from "./data/articles.json";
import chakraQuestions from "./data/chakraQuestions.json";
import "./ChakraOfKnowledge.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLanguage } from "./context/LanguageContext";
import config from "./config";
import { Lock, LockOpen, CheckCircle2, XCircle } from "lucide-react";

const SEGMENTS = [
  "Executive",
  "Legislature",
  "Judiciary",
  "Executive",
  "Legislature",
  "Judiciary",
  "Executive",
  "Legislature",
];

export default function ChakraOfKnowledge() {
  const { t } = useLanguage();
  const location = useLocation();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const quizRef = useRef(null);

  // Quiz and Difficulty States
  const [difficulty, setDifficulty] = useState("Easy");
  const [unlockedLevels, setUnlockedLevels] = useState(["Easy"]);
  const [articlesRead, setArticlesRead] = useState(0);
  const [loading, setLoading] = useState(true);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      const email = localStorage.getItem('userEmail');
      const isGuest = localStorage.getItem('isGuest') === 'true';
      if (!email || isGuest) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${config.API_URL}/api/progress/${email}`, {
          headers: { "ngrok-skip-browser-warning": "true" }
        });
        if (res.ok) {
          const data = await res.json();
          setArticlesRead(data.articlesRead || 0);

          const allGames = ["articleMatch", "rightsDutiesClimb", "constitutionCards", "chakra", "quiz", "sort"];
          const completed = data.completedLevels || {};
          const levels = ["Easy"];

          if (allGames.every(g => completed[g]?.includes("Easy"))) levels.push("Medium");
          if (allGames.every(g => completed[g]?.includes("Medium"))) levels.push("Hard");

          setUnlockedLevels(levels);
        }
      } catch (e) {
        console.error("Failed to fetch progress", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [difficulty]); // Refetch on difficulty change to check unlocks

  const spinWheel = () => {
    if (isSpinning || isLevelComplete) return;

    setIsSpinning(true);
    setSelectedArticle(null);
    setCurrentQuestion(null);
    setFeedback(null);
    setIsAnswered(false);
    setSelectedOption(null);

    const newRotation = rotation + 1440 + Math.random() * 360;
    setRotation(newRotation);

    setTimeout(() => {
      const queryParams = new URLSearchParams(location.search);
      const selectedCatParams = queryParams.get("category");

      const finalAngle = (newRotation % 360);
      let category = "";
      if (selectedCatParams) {
        category = selectedCatParams;
      } else {
        if (finalAngle >= 0 && finalAngle < 120) category = "Executive";
        else if (finalAngle >= 120 && finalAngle < 240) category = "Legislature";
        else category = "Judiciary";
      }

      // Select a random article
      const artPool = articles.filter(a => a.category === category);
      const randomArticle = artPool[Math.floor(Math.random() * artPool.length)];
      setSelectedArticle(randomArticle);

      // Select a random question based on category and difficulty
      const qPool = chakraQuestions.filter(q => q.category === category && q.difficulty === difficulty);
      const randomQuestion = qPool[Math.floor(Math.random() * qPool.length)];
      setCurrentQuestion(randomQuestion);

      setIsSpinning(false);
      setShowQuizModal(true);

      // Auto-scroll to quiz section on mobile after spin
      if (window.innerWidth < 768 && quizRef.current) {
        quizRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }, 4000);
  };

  const handleAnswer = async (index) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);
    const isCorrect = index === currentQuestion.correctIndex;
    setFeedback(isCorrect ? "correct" : "wrong");

    const newCount = answeredCount + 1;
    setAnsweredCount(newCount);

    if (isCorrect) {
      updateProgress(currentQuestion.category, false);
    }

    if (newCount >= 10) {
      setTimeout(() => {
        setIsLevelComplete(true);
        updateProgress(currentQuestion.category, true);
        setShowQuizModal(false);
      }, 2000);
    } else {
      setTimeout(() => {
        setShowQuizModal(false);
      }, 2000);
    }
  };

  const updateProgress = async (category, isCompletion) => {
    const email = localStorage.getItem('userEmail');
    const isGuest = localStorage.getItem('isGuest') === 'true';
    if (!email || isGuest) return;

    const masteryKey = category.toLowerCase();
    const points = difficulty === "Hard" ? 20 : (difficulty === "Medium" ? 15 : 10);
    const bonusPoints = isCompletion ? (difficulty === "Hard" ? 50 : (difficulty === "Medium" ? 30 : 20)) : 0;

    try {
      await fetch(`${config.API_URL}/api/progress/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          email,
          gamesPlayed: isCompletion ? 1 : 0,
          articlesRead: isCompletion ? 0 : 1,
          totalPoints: points + bonusPoints,
          mastery: { [masteryKey]: 5 },
          gameId: "chakra",
          completedLevel: isCompletion ? difficulty : null
        }),
      });
    } catch (e) {
      console.error("Progress update failed", e);
    }
  };

  const resetLevel = () => {
    setAnsweredCount(0);
    setIsLevelComplete(false);
    setCurrentQuestion(null);
    setSelectedArticle(null);
  };

  function handleBack() {
    window.history.back();
  }

  const getTranslatedCategory = (cat) => {
    if (!cat) return "";
    const lower = cat.toLowerCase();
    return t.chakra.segments[lower] || cat;
  };

  return (
    <>
      <Navbar />

      <main className="chakra-page">
        {articlesRead < 10 && !loading && (
          <div className="locked-overlay-chakra">
            <div className="locked-card-chakra">
              <div className="lock-icon-wrapper-chakra">
                <Lock size={48} />
              </div>
              <h2>{t.gamesPage?.lockedMessage || "Game Locked!"}</h2>
              <p>Read at least 10 articles to unlock the Chakra of Knowledge.</p>
              <div className="unlock-progress-chakra">
                <div className="progress-text-chakra">
                  <span>{articlesRead} / 10 Articles Read</span>
                </div>
                <div className="progress-bar-mini-chakra">
                  <div className="fill-chakra" style={{ width: `${(articlesRead / 10) * 100}%` }}></div>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/learn'}
                className="unlock-btn-chakra"
              >
                Go to Learn
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="chakra-header">
          <button className="back-btn" onClick={handleBack}>←</button>
          <div>
            <h1>{t.chakra.title}</h1>
            <p>{t.chakra.desc}</p>
          </div>
        </header>

        {/* Difficulty Selection overlay patterns (Standardized) */}
        <div className="difficulty-container-chakra" style={{ marginBottom: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
          {['Easy', 'Medium', 'Hard'].map((level) => {
            const isUnlocked = unlockedLevels.includes(level);
            return (
              <button
                key={level}
                onClick={() => {
                  if (isUnlocked) {
                    setDifficulty(level);
                    resetLevel();
                  }
                }}
                className={`diff-btn-chakra ${difficulty === level ? 'active' : ''}`}
                disabled={!isUnlocked}
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

        <div className="chakra-content">
          {/* Wheel Section */}
          <div className="wheel-section">
            <div className="pointer"></div>

            <div
              className="spin-wheel-container"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <svg viewBox="0 0 100 100" className="spin-wheel-svg">
                {[
                  "#1e3a5f", "#d97706", "#166534", "#1e4a6f",
                  "#e97706", "#186534", "#1e3a7f", "#c97706",
                ].map((color, i) => {
                  const startAngle = i * 45;
                  const endAngle = startAngle + 45;
                  const polar = (angle) => {
                    const rad = (angle - 90) * (Math.PI / 180);
                    return {
                      x: 50 + 50 * Math.cos(rad),
                      y: 50 + 50 * Math.sin(rad),
                    };
                  };
                  const p1 = polar(startAngle);
                  const p2 = polar(endAngle);
                  const icons = ["🏛️", "📜", "⚖️"];

                  return (
                    <g key={i}>
                      <path
                        d={`M 50 50 L ${p1.x} ${p1.y} A 50 50 0 0 1 ${p2.x} ${p2.y} Z`}
                        fill={color}
                        stroke="#fff"
                        strokeWidth="0.5"
                      />
                      <text
                        x={50 + 30 * Math.cos(((startAngle + 22.5) - 90) * Math.PI / 180)}
                        y={50 + 30 * Math.sin(((startAngle + 22.5) - 90) * Math.PI / 180)}
                        className="wheel-text"
                      >
                        {icons[i % 3]}
                      </text>
                    </g>
                  );
                })}
                <circle cx="50" cy="50" r="12" className="center-circle-outer" />
                <circle cx="50" cy="50" r="10" className="center-circle-inner" />
                <text x="50" y="50" className="center-icon">⚖️</text>
              </svg>
            </div>
            <div className="wheel-controls">
              <button
                className={`spin-btn ${isSpinning ? "spinning" : ""}`}
                onClick={spinWheel}
                disabled={isSpinning}
              >
                {isSpinning ? "..." : t.chakra.spinBtn}
              </button>
            </div>
          </div>

          {/* Quiz/Info Section (Inline) */}
          <div className="quiz-section-chakra" ref={quizRef}>
            {!currentQuestion ? (
              <div className="info-card-chakra center">
                <div className="big-icon-chakra">🎡</div>
                <h3 className="h3-chakra">{t.chakra.infoTitle}</h3>
                <p className="p-chakra">{t.chakra.infoDesc}</p>
              </div>
            ) : isLevelComplete ? (
              <div className="chakra-completion-card animated fadeIn">
                <div className="completion-icon">🏆</div>
                <h2>Level Completed!</h2>
                <p>You've successfully answered 10 questions in {t.common.difficulty[difficulty]} mode.</p>
                <div className="completion-stats">
                  <span>Questions: 10/10</span>
                  <span>Difficulty: {difficulty}</span>
                </div>
                <button className="continue-btn-chakra" onClick={resetLevel}>
                  Play Again
                </button>
              </div>
            ) : (
              <div className="chakra-quiz-card-inline">
                {/* Progress Indicator */}
                <div className="chakra-progress-wrap">
                  <div className="chakra-progress-text">
                    Question {answeredCount} / 10
                  </div>
                  <div className="chakra-progress-bar">
                    <div
                      className="chakra-progress-fill"
                      style={{ width: `${((answeredCount) / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="quiz-header-chakra">
                  <span className={`category-tag-chakra ${currentQuestion.category}`}>
                    {getTranslatedCategory(currentQuestion.category)}
                  </span>
                  <span className="difficulty-tag-chakra">
                    {t.common.difficulty[difficulty]}
                  </span>
                </div>

                <h2 className="chakra-q-title">{currentQuestion.question}</h2>

                <div className="chakra-options-grid">
                  {currentQuestion.options.map((option, idx) => {
                    let statusClass = "";
                    if (isAnswered) {
                      if (idx === currentQuestion.correctIndex) statusClass = "correct";
                      else if (idx === selectedOption) statusClass = "wrong";
                    }

                    return (
                      <button
                        key={idx}
                        className={`chakra-option-btn ${statusClass} ${selectedOption === idx ? 'selected' : ''}`}
                        onClick={() => handleAnswer(idx)}
                        disabled={isAnswered || isSpinning}
                      >
                        <span className="opt-idx-chakra">{String.fromCharCode(65 + idx)}</span>
                        {option}
                        {statusClass === "correct" && <CheckCircle2 size={18} style={{ marginLeft: 'auto', color: '#22c55e' }} />}
                        {statusClass === "wrong" && <XCircle size={18} style={{ marginLeft: 'auto', color: '#ef4444' }} />}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && selectedArticle && (
                  <div className="article-fact-preview animated fadeIn">
                    <div className="article-preview-label">Did you know? (Art. {selectedArticle.number})</div>
                    <p>{selectedArticle.simplifiedText}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
