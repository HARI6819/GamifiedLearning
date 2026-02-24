import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "./context/LanguageContext";
import { useTheme } from "./context/ThemeContext";
import "./JusticeJury.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Scale, Lock, LockOpen, CheckCircle, XCircle, BookOpen, Award, RotateCcw, MessageSquare } from "lucide-react";
import config from "./config";

export default function JusticeJury() {
    const { t } = useLanguage();
    const location = useLocation();
    const { theme } = useTheme();
    const [gameState, setGameState] = useState("start"); // start, lawyers, decision, feedback, complete
    const [difficulty, setDifficulty] = useState("Easy");
    const [unlockedLevels, setUnlockedLevels] = useState(["Easy"]);
    const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [score, setScore] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [cases, setCases] = useState([]);
    const [accuracyPercentage, setAccuracyPercentage] = useState(0);
    const [showingLawyer, setShowingLawyer] = useState("lawyer1");
    const [lawyerArgumentRead, setLawyerArgumentRead] = useState({ lawyer1: false, lawyer2: false });
    const [debugData, setDebugData] = useState(null);
    useEffect(() => {
        const fetchProgress = async () => {
            const email = localStorage.getItem('userEmail');
            const isGuest = localStorage.getItem('isGuest') === 'true';
            
            console.log("🔒 JusticeJury - Checking lock mechanism:", { email, isGuest });
            
            if (!email || isGuest) {
                // Guest mode: only Easy level available
                console.log("👤 Guest mode - only Easy available");
                setUnlockedLevels(["Easy"]);
                return;
            }
            try {
                const res = await fetch(`${config.API_URL}/api/progress/${email}`, {
                    headers: { "ngrok-skip-browser-warning": "true" }
                });
                if (res.ok) {
                    const data = await res.json();
                    
                    // Store debug data for display
                    setDebugData({
                        email,
                        rawBackendResponse: data,
                        completedLevels: data.completedLevels || {},
                        timestamp: new Date().toLocaleTimeString()
                    });
                    
                    // Check JUSTICE JURY's own completed levels to unlock progression
                    const justiceJuryLevels = data.completedLevels?.justiceJury || [];
                    
                    console.log("📊 Raw completed levels from backend:", JSON.stringify(data.completedLevels, null, 2));
                    console.log("🎯 JusticeJury completed levels:", justiceJuryLevels);
                    
                    const levels = ["Easy"];
                    
                    // Medium unlocks when Easy is completed in Justice Jury
                    if (justiceJuryLevels.includes("Easy")) {
                        console.log("✅ Easy completed - unlocking Medium");
                        levels.push("Medium");
                    }
                    
                    // Hard unlocks when Medium is completed in Justice Jury
                    if (justiceJuryLevels.includes("Medium")) {
                        console.log("✅✅ Medium completed - unlocking Hard");
                        levels.push("Hard");
                    }
                    
                    console.log("🔓 FINAL Unlocked levels for Justice Jury:", levels);
                    setUnlockedLevels(levels);
                }
            } catch (e) {
                console.error("Failed to fetch progress", e);
                // On error, still allow Easy level
                setUnlockedLevels(["Easy"]);
            }
        };
        fetchProgress();
    }, []);

    // Update cases when language changes
    useEffect(() => {
        if (cases.length > 0 && gameState !== "start") {
            // Reload current case in new language
            const newCaseList = t.justiceJury.cases[difficulty];
            setCases(newCaseList);
        }
    }, [t.justiceJury]); // Reacts to language changes through translations

    const startGame = () => {
        const queryParams = new URLSearchParams(location.search);
        const selectedCat = queryParams.get("category");

        let caseList = t.justiceJury.cases[difficulty];

        if (selectedCat) {
            caseList = caseList.filter(c => c.category === selectedCat);
        }

        setCases(caseList);
        setCurrentCaseIndex(0);
        setScore(0);
        setCorrectAnswers(0);
        setSelectedChoice(null);
        setLawyerArgumentRead({ lawyer1: false, lawyer2: false });
        setShowingLawyer("lawyer1");
        setGameState("lawyers");
    };

    const handleNextLawyer = () => {
        if (showingLawyer === "lawyer1") {
            setLawyerArgumentRead(prev => ({ ...prev, lawyer1: true }));
            setShowingLawyer("lawyer2");
        } else if (showingLawyer === "lawyer2") {
            setLawyerArgumentRead(prev => ({ ...prev, lawyer2: true }));
            setGameState("decision");
        }
    };

    const handleChoiceSelect = (choiceId) => {
        setSelectedChoice(choiceId);
    };

    const handleSubmitChoice = () => {
        if (!selectedChoice) return;

        const currentCase = cases[currentCaseIndex];
        const isCorrect = selectedChoice === currentCase.correctChoice;
        
        // Calculate accuracy components
        const scoreChanges = {
            answerMatch: isCorrect ? 40 : 0,
            reasoningQuality: 0,
            constitutionalKnowledge: 0,
            precedentUnderstanding: 0
        };

        if (selectedChoice === currentCase.correctChoice) {
            scoreChanges.reasoningQuality = 30;
            scoreChanges.constitutionalKnowledge = 20;
            scoreChanges.precedentUnderstanding = 10;
            setScore(prev => prev + 100);
        } else if (selectedChoice === "partial" && currentCase.correctChoice === "partial") {
            scoreChanges.reasoningQuality = 20;
            scoreChanges.constitutionalKnowledge = 15;
            scoreChanges.precedentUnderstanding = 5;
            setScore(prev => prev + 60);
        } else {
            scoreChanges.reasoningQuality = 10;
            scoreChanges.constitutionalKnowledge = 5;
            setScore(prev => prev + 15);
        }

        if (isCorrect || (selectedChoice === "partial" && currentCase.correctChoice === "partial")) {
            setCorrectAnswers(prev => prev + 1);
        }

        setGameState("feedback");
    };

    const handleNextCase = () => {
        if (currentCaseIndex < cases.length - 1) {
            setCurrentCaseIndex(prev => prev + 1);
            setSelectedChoice(null);
            setLawyerArgumentRead({ lawyer1: false, lawyer2: false });
            setShowingLawyer("lawyer1");
            setGameState("lawyers");
        } else {
            const accuracy = Math.round((correctAnswers / cases.length) * 100);
            setAccuracyPercentage(accuracy);
            setGameState("complete");
            updateProgress();
        }
    };

    const updateProgress = async () => {
        const email = localStorage.getItem('userEmail');
        const isGuest = localStorage.getItem('isGuest') === 'true';
        
        console.log("Updating progress for:", { email, isGuest, score, difficulty });
        
        if (!email || isGuest) {
            console.log("Guest mode or no email - skipping progress update");
            return;
        }

        try {
            const progressData = {
                email,
                gamesPlayed: 1,
                totalPoints: score,
                gameId: "justiceJury",
                completedLevel: difficulty,
                mastery: { judiciary: 5 }
            };

            console.log("Sending progress data:", progressData);

            const response = await fetch(`${config.API_URL}/api/progress/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify(progressData)
            });

            if (!response.ok) {
                console.error("Progress update failed with status:", response.status);
                const errorData = await response.json();
                console.error("Error response:", errorData);
            } else {
                const resultData = await response.json();
                console.log("Progress updated successfully:", resultData);
            }
        } catch (e) {
            console.error("Failed to update progress:", e);
        }
    };

    const currentCase = cases[currentCaseIndex];
    const isCorrect = selectedChoice === currentCase?.correctChoice;

    return (
        <>
            <section className="section1">
                <Navbar />
            </section>
            <main className={`justice-container ${theme}`}>
                <header className="justice-header">
                    <button onClick={() => window.history.back()} className="back-btn">←</button>
                    <div>
                        <h1>⚖️ {t.justiceJury.title}</h1>
                        <p>{t.justiceJury.desc}</p>
                    </div>
                </header>

                {gameState === "start" && (
                    <div className="start-screen">
                        <div className="icon-wrapper">⚖️</div>
                        <h2>{t.justiceJury.startTitle}</h2>
                        <p style={{ fontFamily: "sans-serif", marginBottom: "20px", fontSize: ".9rem", maxWidth: "80%", color: "grey" }}>
                            {t.justiceJury.startDesc}
                        </p>
                        <h4>{t.justiceJury.difficulty}</h4>
                        <div className="diff-grid1">
                            {['Easy', 'Medium', 'Hard'].map((level) => {
                                const isUnlocked = unlockedLevels.includes(level);
                                return (
                                    <button
                                        key={level}
                                        className={`diff-btn ${difficulty === level ? 'active' : ''} ${!isUnlocked && level !== 'Easy' ? 'locked' : ''}`}
                                        onClick={() => isUnlocked && setDifficulty(level)}
                                        disabled={!isUnlocked && level !== 'Easy'}
                                    >
                                        {!isUnlocked && level !== 'Easy' ? <Lock size={16} /> : ''}
                                        <span>{level}</span>
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button onClick={startGame} className="play-btn">
                            {t.justiceJury.startButton}
                        </button>
                    </div>
                )}

                {gameState === "lawyers" && currentCase && (
                    <div className="lawyers-screen">
                        <div className="case-info">
                            <h2>{currentCase.title}</h2>
                            <div className="case-context">
                                <p>{currentCase.context}</p>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${((currentCaseIndex + 1) / cases.length) * 100}%` }}></div>
                            </div>
                            <p className="case-counter">
                                {currentCaseIndex + 1} {t.justiceJury.of} {cases.length}
                            </p>
                        </div>

                        <div className="lawyers-container">
                            {showingLawyer === "lawyer1" && (
                                <div className="lawyer-card lawyer1-card">
                                    <div className="lawyer-header">
                                        <span className="lawyer-icon">👨‍⚖️</span>
                                        <h3>{currentCase.lawyer1.name}</h3>
                                        <span className="lawyer-side">{currentCase.lawyer1.side}</span>
                                    </div>
                                    <div className="lawyer-content">
                                        <p className="lawyer-argument">{currentCase.lawyer1.argument}</p>
                                        <div className="lawyer-points">
                                            <h4>{t.justiceJury.keyPoints}:</h4>
                                            <ul>
                                                {currentCase.lawyer1.points.map((point, idx) => (
                                                    <li key={idx}>
                                                        <span className="point-icon">→</span>
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showingLawyer === "lawyer2" && (
                                <div className="lawyer-card lawyer2-card">
                                    <div className="lawyer-header">
                                        <span className="lawyer-icon">👩‍⚖️</span>
                                        <h3>{currentCase.lawyer2.name}</h3>
                                        <span className="lawyer-side">{currentCase.lawyer2.side}</span>
                                    </div>
                                    <div className="lawyer-content">
                                        <p className="lawyer-argument">{currentCase.lawyer2.argument}</p>
                                        <div className="lawyer-points">
                                            <h4>{t.justiceJury.keyPoints}:</h4>
                                            <ul>
                                                {currentCase.lawyer2.points.map((point, idx) => (
                                                    <li key={idx}>
                                                        <span className="point-icon">→</span>
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={handleNextLawyer} className="next-lawyer-btn">
                            {showingLawyer === "lawyer1" ? t.justiceJury.hearLawyer2 : t.justiceJury.heardBoth}
                            <span> →</span>
                        </button>
                    </div>
                )}

                {gameState === "decision" && currentCase && (
                    <div className="decision-screen">
                        <div className="case-summary">
                            <h2>{currentCase.title}</h2>
                            <p className="summary-text">{currentCase.context}</p>
                            <p className="decision-prompt">{t.justiceJury.makeDecision}</p>
                        </div>

                        <div className="choices-grid">
                            {currentCase.choices.map((choice) => (
                                <button
                                    key={choice.id}
                                    className={`choice-btn ${selectedChoice === choice.id ? 'selected' : ''}`}
                                    onClick={() => handleChoiceSelect(choice.id)}
                                >
                                    <div className="choice-icon">{choice.icon}</div>
                                    <div className="choice-content">
                                        <h4>{choice.label}</h4>
                                        <p>{choice.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleSubmitChoice}
                            disabled={!selectedChoice}
                            className="submit-btn"
                        >
                            {t.justiceJury.submitDecision}
                        </button>
                    </div>
                )}

                {gameState === "feedback" && currentCase && (
                    <div className="feedback-screen">
                        <div className={`feedback-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                            {isCorrect ? (
                                <>
                                    <CheckCircle size={60} />
                                    <h2>{t.justiceJury.correctDecision}</h2>
                                </>
                            ) : (
                                <>
                                    <XCircle size={60} />
                                    <h2>{t.justiceJury.incorrectDecision}</h2>
                                </>
                            )}
                        </div>

                        <div className="feedback-details">
                            <div className="correct-answer">
                                <h3>{t.justiceJury.correctAnswer}:</h3>
                                <p className="answer-text">
                                    {currentCase.choices.find(c => c.id === currentCase.correctChoice)?.label}
                                </p>
                            </div>

                            <div className="explanation">
                                <h3>{t.justiceJury.explanation}:</h3>
                                <p>{currentCase.explanation}</p>
                            </div>

                            <div className="relevant-articles">
                                <h3>{t.justiceJury.relevantArticles}:</h3>
                                <div className="articles-list">
                                    {currentCase.relevantArticles.map((article, idx) => (
                                        <div key={idx} className="article-tag">
                                            <strong>Article {article.number}:</strong> {article.title}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="scoring-breakdown">
                                <h3>{t.justiceJury.scoringBreakdown}:</h3>
                                <div className="score-items">
                                    <div className="score-item">
                                        <span>{t.justiceJury.answerMatch}</span>
                                        <span className="points">{isCorrect ? 40 : 0} pts</span>
                                    </div>
                                    <div className="score-item">
                                        <span>{t.justiceJury.reasoning}</span>
                                        <span className="points">{isCorrect ? 30 : 10} pts</span>
                                    </div>
                                    <div className="score-item">
                                        <span>{t.justiceJury.constitutionalKnowledge}</span>
                                        <span className="points">{isCorrect ? 20 : 5} pts</span>
                                    </div>
                                    <div className="score-item">
                                        <span>{t.justiceJury.precedent}</span>
                                        <span className="points">{isCorrect ? 10 : 0} pts</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleNextCase} className="next-case-btn">
                            {currentCaseIndex < cases.length - 1 ? t.justiceJury.nextCase : t.justiceJury.seeResults}
                            <span> →</span>
                        </button>
                    </div>
                )}

                {gameState === "complete" && (
                    <div className="complete-screen">
                        <div className="completion-badge">
                            <Award size={80} />
                            <h1>{t.justiceJury.gameComplete}</h1>
                        </div>

                        <div className="results-summary">
                            <div className="result-card accuracy">
                                <div className="result-value">{accuracyPercentage}%</div>
                                <div className="result-label">{t.justiceJury.accuracy}</div>
                            </div>
                            <div className="result-card score">
                                <div className="result-value">{score}</div>
                                <div className="result-label">{t.justiceJury.totalPoints}</div>
                            </div>
                            <div className="result-card correct">
                                <div className="result-value">{correctAnswers}/{cases.length}</div>
                                <div className="result-label">{t.justiceJury.correctAnswers}</div>
                            </div>
                        </div>

                        <div className="accuracy-breakdown">
                            <h3>{t.justiceJury.accuracyBreakdown}:</h3>
                            {accuracyPercentage >= 90 && <p className="breakdown-text excellent">{t.justiceJury.excellent}</p>}
                            {accuracyPercentage >= 75 && accuracyPercentage < 90 && <p className="breakdown-text good">{t.justiceJury.good}</p>}
                            {accuracyPercentage >= 60 && accuracyPercentage < 75 && <p className="breakdown-text fair">{t.justiceJury.fair}</p>}
                            {accuracyPercentage < 60 && <p className="breakdown-text needsImprovement">{t.justiceJury.needsImprovement}</p>}
                        </div>

                        <div className="actions-group">
                            <button onClick={() => window.location.href = '/games'} className="return-btn">
                                {t.justiceJury.backToGames}
                            </button>
                            <button onClick={() => {
                                setGameState("start");
                                setCurrentCaseIndex(0);
                                setSelectedChoice(null);
                                setScore(0);
                                setCorrectAnswers(0);
                                setAccuracyPercentage(0);
                            }} className="replay-btn">
                                <RotateCcw size={18} />
                                {t.justiceJury.playAgain}
                            </button>
                        </div>
                    </div>
                )}
            </main>
            <section className="section2">
                <Footer />
            </section>
        </>
    );
}
