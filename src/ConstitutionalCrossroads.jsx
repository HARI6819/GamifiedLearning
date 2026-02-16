import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "./context/LanguageContext";
import { useTheme } from "./context/ThemeContext";
import "./ConstitutionalCrossroads.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Scale, Lock, LockOpen, CheckCircle, XCircle, BookOpen, Award, RotateCcw } from "lucide-react";
import config from "./config";

export default function ConstitutionalCrossroads() {
    const { t } = useLanguage();
    const location = useLocation();
    const { theme } = useTheme();
    const [gameState, setGameState] = useState("start"); // start, scenario, feedback, complete
    const [difficulty, setDifficulty] = useState("Easy");
    const [unlockedLevels, setUnlockedLevels] = useState(["Easy"]);
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [score, setScore] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [scenarios, setScenarios] = useState([]);

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
                    const allGames = ["articleMatch", "rightsDutiesClimb", "constitutionCards", "chakra", "quiz", "sort", "crossroads"];
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

    const startGame = () => {
        const queryParams = new URLSearchParams(location.search);
        const selectedCat = queryParams.get("category");

        let scenarioList = t.constitutionalCrossroads.scenarios[difficulty];

        if (selectedCat) {
            scenarioList = scenarioList.filter(s => s.category === selectedCat);
        }

        setScenarios(scenarioList);
        setCurrentScenarioIndex(0);
        setScore(0);
        setCorrectAnswers(0);
        setSelectedChoice(null);
        setGameState("scenario");
    };

    const handleChoiceSelect = (choiceId) => {
        setSelectedChoice(choiceId);
    };

    const handleSubmitChoice = () => {
        if (!selectedChoice) return;

        const currentScenario = scenarios[currentScenarioIndex];
        const isCorrect = selectedChoice === currentScenario.correctChoice;

        if (isCorrect) {
            const points = difficulty === "Hard" ? 20 : (difficulty === "Medium" ? 15 : 10);
            setScore(prev => prev + points);
            setCorrectAnswers(prev => prev + 1);
        }

        setGameState("feedback");
    };

    const handleNextScenario = () => {
        if (currentScenarioIndex < scenarios.length - 1) {
            setCurrentScenarioIndex(prev => prev + 1);
            setSelectedChoice(null);
            setGameState("scenario");
        } else {
            setGameState("complete");
            updateProgress();
        }
    };

    const updateProgress = async () => {
        const email = localStorage.getItem('userEmail');
        const isGuest = localStorage.getItem('isGuest') === 'true';
        if (!email || isGuest) return;

        try {
            await fetch(`${config.API_URL}/api/progress/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify({
                    email,
                    gamesPlayed: 1,
                    totalPoints: score,
                    gameId: "crossroads",
                    completedLevel: difficulty,
                    mastery: { legislature: 3, executive: 3, judiciary: 3 }
                })
            });
        } catch (e) {
            console.error("Failed to update progress", e);
        }
    };

    const currentScenario = scenarios[currentScenarioIndex];
    const isCorrect = selectedChoice === currentScenario?.correctChoice;

    return (
        <>
            <section className="section1">
                <Navbar />
            </section>
            <main className={`crossroads-container ${theme}`}>
                <header className="crossroads-header">
                    <button onClick={() => window.history.back()} className="back-btn">←</button>
                    <div>
                        <h1>⚖️{t.constitutionalCrossroads.title}</h1>
                        <p>{t.constitutionalCrossroads.desc}</p>
                    </div>
                </header>

                {gameState === "start" && (
                    <div className="start-screen">
                        <div className="icon-wrapper">⚖️</div>
                        <h2>{t.constitutionalCrossroads.startTitle}</h2>
                        <p style={{ fontFamily: "sans-serif", marginBottom: "20px", fontSize: ".9rem", maxWidth: "80%", color: "grey" }}>
                            {t.constitutionalCrossroads.startDesc}
                        </p>
                        <h4>{t.constitutionalCrossroads.difficulty}</h4>
                        <div className="diff-grid1">
                            {['Easy', 'Medium', 'Hard'].map((level) => {
                                const isUnlocked = unlockedLevels.includes(level);
                                return (
                                    <button
                                        key={level}
                                        onClick={() => isUnlocked && setDifficulty(level)}
                                        className={`diff-btn1 ${difficulty === level ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`}
                                        disabled={!isUnlocked}
                                    >
                                        {isUnlocked ? (
                                            difficulty !== level && <LockOpen size={14} style={{ marginRight: 8, opacity: 0.7 }} />
                                        ) : (
                                            <Lock size={14} style={{ marginRight: 8 }} />
                                        )}
                                        {t.common.difficulty[level]}
                                    </button>
                                );
                            })}
                        </div>
                        <button className="start-btn" onClick={startGame}>
                            {t.constitutionalCrossroads.startGame}
                        </button>
                    </div>
                )}

                {gameState === "scenario" && currentScenario && (
                    <div className="scenario-screen">
                        <div className="scenario-progress">
                            <span>{t.constitutionalCrossroads.scenario} {currentScenarioIndex + 1}/{scenarios.length}</span>
                            <span>{t.constitutionalCrossroads.score}: {score}</span>
                        </div>

                        <div className="scenario-card">
                            <div className="scenario-title">
                                <Scale size={24} />
                                <h3>{currentScenario.title}</h3>
                            </div>
                            <div className="scenario-situation">
                                <p>{currentScenario.situation}</p>
                            </div>

                            <div className="choices-container">
                                {currentScenario.choices.map((choice) => (
                                    <button
                                        key={choice.id}
                                        onClick={() => handleChoiceSelect(choice.id)}
                                        className={`choice-btn ${selectedChoice === choice.id ? 'selected' : ''}`}
                                    >
                                        <span className="choice-letter">{choice.id.toUpperCase()}</span>
                                        <span className="choice-text">{choice.text}</span>
                                    </button>
                                ))}
                            </div>

                            <button
                                className="submit-choice-btn"
                                onClick={handleSubmitChoice}
                                disabled={!selectedChoice}
                            >
                                Submit Answer
                            </button>
                        </div>
                    </div>
                )}

                {(gameState === "feedback" || gameState === "complete") && currentScenario && (
                    <div className="feedback-screen" style={gameState === "complete" ? { filter: 'blur(4px)', pointerEvents: 'none' } : {}}>
                        <div className="feedback-card">
                            <div className={`feedback-header ${isCorrect ? 'correct' : 'incorrect'}`}>
                                {isCorrect ? (
                                    <>
                                        <CheckCircle size={48} />
                                        <h2>{t.constitutionalCrossroads.correct}</h2>
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={48} />
                                        <h2>{t.constitutionalCrossroads.incorrect}</h2>
                                    </>
                                )}
                            </div>

                            <div className="feedback-content">
                                <div className="correct-answer-section">
                                    <strong>Correct Answer:</strong>
                                    <p>{currentScenario.choices.find(c => c.id === currentScenario.correctChoice)?.text}</p>
                                </div>

                                <div className="explanation-section">
                                    <div className="section-header">
                                        <BookOpen size={20} />
                                        <strong>{t.constitutionalCrossroads.explanation}</strong>
                                    </div>
                                    <p>{currentScenario.explanation}</p>
                                </div>

                                <div className="articles-section">
                                    <strong>{t.constitutionalCrossroads.relevantArticles}:</strong>
                                    <div className="articles-list">
                                        {currentScenario.articles.map((article, index) => (
                                            <span key={index} className="article-badge">{article}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button className="next-scenario-btn" onClick={handleNextScenario}>
                                {currentScenarioIndex < scenarios.length - 1
                                    ? t.constitutionalCrossroads.nextScenario
                                    : t.constitutionalCrossroads.viewResults}
                            </button>
                        </div>
                    </div>
                )}

                {gameState === "complete" && (
                    <div className="crossroads-completion-overlay animated fadeIn">
                        <div className="crossroads-completion-card">
                            <div className="completion-icon">🏆</div>
                            <h2>{t.constitutionalCrossroads.completion.title}</h2>
                            <p>{t.constitutionalCrossroads.completion.desc}</p>

                            <div className="completion-stats">
                                <div className="stat-pill">
                                    {t.constitutionalCrossroads.completion.correctAnswers}: {correctAnswers}/{scenarios.length}
                                </div>
                                <div className="stat-pill">
                                    {t.constitutionalCrossroads.completion.totalScore}: {score}
                                </div>
                            </div>

                            <button className="continue-btn-crossroads" onClick={() => setGameState("start")}>
                                <RotateCcw size={18} /> {t.constitutionalCrossroads.completion.playAgain}
                            </button>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
