import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "./context/LanguageContext";
import { useTheme } from "./context/ThemeContext";
import "./JusticeJury.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Scale, Lock, LockOpen, CheckCircle, XCircle, BookOpen, Award, RotateCcw, MessageSquare } from "lucide-react";
import config from "./config";
import justiceJuryQuestionsLocal from "./data/justiceJuryQuestions.json";
import { useGameQuestions } from "./hooks/useGameQuestions";
import TranslatedText from "./TranslatedText";

export default function JusticeJury() {
    const { t } = useLanguage();
    const location = useLocation();
    const { theme } = useTheme();
    const { data: justiceJuryQuestions } = useGameQuestions("justiceJury", justiceJuryQuestionsLocal, false);
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
            const newCaseList = justiceJuryQuestions[difficulty];
            setCases(newCaseList);
        }
    }, [t.justiceJury]); // Reacts to language changes through translations

    const startGame = () => {
        const queryParams = new URLSearchParams(location.search);
        const selectedCat = queryParams.get("category");

        let caseList = justiceJuryQuestions[difficulty];

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
                        <h1>⚖️ <TranslatedText>{t.justiceJury.title}</TranslatedText></h1>
                        <p><TranslatedText>{t.justiceJury.desc}</TranslatedText></p>
                    </div>
                </header>

                {gameState === "start" && (
                    <div className="start-screen-jj">
                        <div className="icon-wrapper-jj"><Scale size={40} /></div>
                        <h2><TranslatedText>{t.justiceJury.startTitle}</TranslatedText></h2>
                        <p><TranslatedText>{t.justiceJury.startDesc}</TranslatedText></p>

                        <h4 style={{ fontFamily: "'Times New Roman', serif", fontWeight: 700, marginTop: '1rem' }}><TranslatedText>{t.justiceJury.difficulty}</TranslatedText></h4>
                        <div className="diff-grid-jj">
                            {['Easy', 'Medium', 'Hard'].map((level) => {
                                const isUnlocked = unlockedLevels.includes(level);
                                return (
                                    <button
                                        key={level}
                                        onClick={() => isUnlocked && setDifficulty(level)}
                                        className={`diff-btn-jj ${difficulty === level ? 'active' : ''}`}
                                        disabled={!isUnlocked}
                                    >
                                        {!isUnlocked ? <Lock size={14} /> : (difficulty !== level && <LockOpen size={14} style={{ opacity: 0.7 }} />)}
                                        <TranslatedText>{t.common?.difficulty?.[level] || level}</TranslatedText>
                                    </button>
                                );
                            })}
                        </div>
                        <button className="start-btn-jj" onClick={startGame}>
                            <TranslatedText>{t.justiceJury.startButton}</TranslatedText>
                        </button>
                    </div>
                )}

                {gameState === "lawyers" && currentCase && (
                    <div className="lawyers-screen">
                        <div className="case-info">
                            <h2><TranslatedText>{currentCase.title}</TranslatedText></h2>
                            <div className="case-context">
                                <p><TranslatedText>{currentCase.context}</TranslatedText></p>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${((currentCaseIndex + 1) / cases.length) * 100}%` }}></div>
                            </div>
                            <p className="case-counter">
                                {currentCaseIndex + 1} <TranslatedText>{t.justiceJury.of}</TranslatedText> {cases.length}
                            </p>
                        </div>

                        <div className="lawyers-container">
                            {showingLawyer === "lawyer1" && (
                                <div className="lawyer-card lawyer1-card">
                                    <div className="lawyer-header">
                                        <span className="lawyer-icon">👨‍⚖️</span>
                                        <h3><TranslatedText>{currentCase.lawyer1.name}</TranslatedText></h3>
                                        <span className="lawyer-side"><TranslatedText>{currentCase.lawyer1.side}</TranslatedText></span>
                                    </div>
                                    <div className="lawyer-content">
                                        <p className="lawyer-argument"><TranslatedText>{currentCase.lawyer1.argument}</TranslatedText></p>
                                        <div className="lawyer-points">
                                            <h4><TranslatedText>{t.justiceJury.keyPoints}</TranslatedText>:</h4>
                                            <ul>
                                                {currentCase.lawyer1.points.map((point, idx) => (
                                                    <li key={idx}>
                                                        <span className="point-icon">→</span>
                                                        <TranslatedText>{point}</TranslatedText>
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
                                        <h3><TranslatedText>{currentCase.lawyer2.name}</TranslatedText></h3>
                                        <span className="lawyer-side"><TranslatedText>{currentCase.lawyer2.side}</TranslatedText></span>
                                    </div>
                                    <div className="lawyer-content">
                                        <p className="lawyer-argument"><TranslatedText>{currentCase.lawyer2.argument}</TranslatedText></p>
                                        <div className="lawyer-points">
                                            <h4><TranslatedText>{t.justiceJury.keyPoints}</TranslatedText>:</h4>
                                            <ul>
                                                {currentCase.lawyer2.points.map((point, idx) => (
                                                    <li key={idx}>
                                                        <span className="point-icon">→</span>
                                                        <TranslatedText>{point}</TranslatedText>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={handleNextLawyer} className="next-lawyer-btn">
                            <TranslatedText>{showingLawyer === "lawyer1" ? t.justiceJury.hearLawyer2 : t.justiceJury.heardBoth}</TranslatedText>
                            <span> →</span>
                        </button>
                    </div>
                )}

                {gameState === "decision" && currentCase && (
                    <div className="decision-screen">
                        <div className="case-summary">
                            <h2><TranslatedText>{currentCase.title}</TranslatedText></h2>
                            <p className="summary-text"><TranslatedText>{currentCase.context}</TranslatedText></p>
                            <p className="decision-prompt"><TranslatedText>{t.justiceJury.makeDecision}</TranslatedText></p>
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
                                        <h4><TranslatedText>{choice.label}</TranslatedText></h4>
                                        <p><TranslatedText>{choice.description}</TranslatedText></p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleSubmitChoice}
                            disabled={!selectedChoice}
                            className="submit-btn"
                        >
                            <TranslatedText>{t.justiceJury.submitDecision}</TranslatedText>
                        </button>
                    </div>
                )}

                {gameState === "feedback" && currentCase && (
                    <div className="feedback-screen">
                        <div className={`feedback-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                            {isCorrect ? (
                                <>
                                    <CheckCircle size={60} />
                                    <h2><TranslatedText>{t.justiceJury.correctDecision}</TranslatedText></h2>
                                </>
                            ) : (
                                <>
                                    <XCircle size={60} />
                                    <h2><TranslatedText>{t.justiceJury.incorrectDecision}</TranslatedText></h2>
                                </>
                            )}
                        </div>

                        <div className="feedback-details">
                            <div className="correct-answer">
                                <h3><TranslatedText>{t.justiceJury.correctAnswer}</TranslatedText>:</h3>
                                <p className="answer-text">
                                    <TranslatedText>{currentCase.choices.find(c => c.id === currentCase.correctChoice)?.label}</TranslatedText>
                                </p>
                            </div>

                            <div className="explanation">
                                <h3><TranslatedText>{t.justiceJury.explanation}</TranslatedText>:</h3>
                                <p><TranslatedText>{currentCase.explanation}</TranslatedText></p>
                            </div>

                            <div className="relevant-articles">
                                <h3><TranslatedText>{t.justiceJury.relevantArticles}</TranslatedText>:</h3>
                                <div className="articles-list">
                                    {currentCase.relevantArticles.map((article, idx) => (
                                        <div key={idx} className="article-tag">
                                            <strong><TranslatedText>Article</TranslatedText> {article.number}:</strong> <TranslatedText>{article.title}</TranslatedText>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="scoring-breakdown">
                                <h3><TranslatedText>{t.justiceJury.scoringBreakdown}</TranslatedText>:</h3>
                                <div className="score-items">
                                    <div className="score-item">
                                        <span><TranslatedText>{t.justiceJury.answerMatch}</TranslatedText></span>
                                        <span className="points">{isCorrect ? 40 : 0} <TranslatedText>pts</TranslatedText></span>
                                    </div>
                                    <div className="score-item">
                                        <span><TranslatedText>{t.justiceJury.reasoning}</TranslatedText></span>
                                        <span className="points">{isCorrect ? 30 : 10} <TranslatedText>pts</TranslatedText></span>
                                    </div>
                                    <div className="score-item">
                                        <span><TranslatedText>{t.justiceJury.constitutionalKnowledge}</TranslatedText></span>
                                        <span className="points">{isCorrect ? 20 : 5} <TranslatedText>pts</TranslatedText></span>
                                    </div>
                                    <div className="score-item">
                                        <span><TranslatedText>{t.justiceJury.precedent}</TranslatedText></span>
                                        <span className="points">{isCorrect ? 10 : 0} <TranslatedText>pts</TranslatedText></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleNextCase} className="next-case-btn">
                            <TranslatedText>{currentCaseIndex < cases.length - 1 ? t.justiceJury.nextCase : t.justiceJury.seeResults}</TranslatedText>
                            <span> →</span>
                        </button>
                    </div>
                )}

                {gameState === "complete" && (
                    <div className="complete-screen">
                        <div className="completion-badge">
                            <Award size={80} />
                            <h1><TranslatedText>{t.justiceJury.gameComplete}</TranslatedText></h1>
                        </div>

                        <div className="results-summary">
                            <div className="result-card accuracy">
                                <div className="result-value">{accuracyPercentage}%</div>
                                <div className="result-label"><TranslatedText>{t.justiceJury.accuracy}</TranslatedText></div>
                            </div>
                            <div className="result-card score">
                                <div className="result-value">{score}</div>
                                <div className="result-label"><TranslatedText>{t.justiceJury.totalPoints}</TranslatedText></div>
                            </div>
                            <div className="result-card correct">
                                <div className="result-value">{correctAnswers}/{cases.length}</div>
                                <div className="result-label"><TranslatedText>{t.justiceJury.correctAnswers}</TranslatedText></div>
                            </div>
                        </div>

                        <div className="accuracy-breakdown">
                            <h3><TranslatedText>{t.justiceJury.accuracyBreakdown}</TranslatedText>:</h3>
                            {accuracyPercentage >= 90 && <p className="breakdown-text excellent"><TranslatedText>{t.justiceJury.excellent}</TranslatedText></p>}
                            {accuracyPercentage >= 75 && accuracyPercentage < 90 && <p className="breakdown-text good"><TranslatedText>{t.justiceJury.good}</TranslatedText></p>}
                            {accuracyPercentage >= 60 && accuracyPercentage < 75 && <p className="breakdown-text fair"><TranslatedText>{t.justiceJury.fair}</TranslatedText></p>}
                            {accuracyPercentage < 60 && <p className="breakdown-text needsImprovement"><TranslatedText>{t.justiceJury.needsImprovement}</TranslatedText></p>}
                        </div>

                        <div className="actions-group">
                            <button onClick={() => window.location.href = '/games'} className="return-btn">
                                <TranslatedText>{t.justiceJury.backToGames}</TranslatedText>
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
                                <TranslatedText>{t.justiceJury.playAgain}</TranslatedText>
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
