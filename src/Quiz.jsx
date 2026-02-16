import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./Quiz.css";
import quizData from "./data/quizData.json";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Timer, Award, ArrowRight, RotateCcw, CheckCircle2, XCircle, Brain, Lock, LockOpen } from "lucide-react";
import { useLanguage } from "./context/LanguageContext";
import config from "./config";

export default function Quiz() {
    const { t } = useLanguage();
    const location = useLocation();
    const [gameState, setGameState] = useState("difficulty"); // difficulty, playing, finished
    const [difficulty, setDifficulty] = useState("Easy"); // Easy, Medium, Hard
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [unlockedLevels, setUnlockedLevels] = useState(["Easy"]);
    const timerRef = useRef(null);

    useEffect(() => {
        const fetchProgress = async () => {
            const email = localStorage.getItem("userEmail");
            const isGuest = localStorage.getItem("isGuest") === "true";
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
    }, [gameState]);

    const startQuiz = () => {
        const queryParams = new URLSearchParams(location.search);
        const selectedCat = queryParams.get("category");

        // Fetch questions from translations
        let localizedQuestions = t.quiz.questions?.[difficulty] || [];

        // Filter by category if one is selected
        if (selectedCat) {
            localizedQuestions = localizedQuestions.filter(q => q.category === selectedCat);
        }

        setQuestions(localizedQuestions.sort(() => Math.random() - 0.5).slice(0, 10));
        setGameState("playing");
        setCurrentIdx(0);
        setScore(0);
        setTimeLeft(30);
        setIsAnswered(false);
        setSelectedAnswer(null);
    };

    useEffect(() => {
        if (gameState === "playing" && !isAnswered) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleAnswer(null); // Auto-submit if time runs out
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [gameState, currentIdx, isAnswered]);

    const handleAnswer = (idx) => {
        if (isAnswered) return;
        clearInterval(timerRef.current);
        setSelectedAnswer(idx);
        setIsAnswered(true);

        const currentQ = questions[currentIdx];
        if (idx === currentQ.correctIndex) {
            setScore((prev) => prev + 1);
        }

        setTimeout(() => {
            if (currentIdx < questions.length - 1) {
                setCurrentIdx((prev) => prev + 1);
                setTimeLeft(30);
                setIsAnswered(false);
                setSelectedAnswer(null);
            } else {
                finishQuiz();
            }
        }, 1500);
    };

    const finishQuiz = async () => {
        setGameState("finished");
        const email = localStorage.getItem("userEmail");
        const isGuest = localStorage.getItem("isGuest") === "true";
        console.log("Quiz finishQuiz check:", { email, isGuest });
        if (!email || isGuest) {
            if (isGuest) console.log("Guest mode detected in Quiz, skipping API update.");
            return;
        }

        const pointsPerCorrect = difficulty === "Hard" ? 10 : (difficulty === "Medium" ? 7 : 5);
        const totalPoints = score * pointsPerCorrect;

        const masteryUpdate = {};
        questions.forEach((q) => {
            const cat = q.category?.toLowerCase();
            if (cat) {
                masteryUpdate[cat] = (masteryUpdate[cat] || 0) + 1;
            }
        });

        try {
            await fetch(`${config.API_URL}/api/progress/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
                body: JSON.stringify({
                    email,
                    gamesPlayed: 1,
                    totalPoints: totalPoints,
                    gameId: "quiz",
                    completedLevel: difficulty,
                    mastery: masteryUpdate
                }),
            });
        } catch (e) {
            console.error("Failed to update quiz progress", e);
        }
    };

    const resetQuiz = () => {
        setGameState("difficulty");
        setDifficulty("Easy");
    };

    return (
        <>
            <Navbar />
            <main className="quiz-container">
                {/* Header */}
                <header className="quiz-header">
                    <button onClick={() => window.history.back()} className="back-btn-quiz">←</button>
                    <div>
                        <h1>🧠{t.quiz.title}</h1>
                        <p>{t.quiz.desc}</p>
                    </div>
                </header>

                {gameState === "difficulty" && (
                    <div className="start-screen-quiz">
                        <div className="icon-wrapper-quiz"><Brain size={40} /></div>
                        <h2>{t.quiz.title}</h2>
                        <p>{t.quiz.startDesc}</p>

                        <h4 style={{ fontFamily: "'Times New Roman', serif", fontWeight: 700, marginTop: '1rem' }}>{t.quiz.difficulty}</h4>
                        <div className="diff-grid-quiz">
                            {["Easy", "Medium", "Hard"].map((level) => {
                                const isUnlocked = unlockedLevels.includes(level);
                                return (
                                    <button
                                        key={level}
                                        onClick={() => isUnlocked && setDifficulty(level)}
                                        className={`diff-btn-quiz ${difficulty === level ? 'active' : ''}`}
                                        disabled={!isUnlocked}
                                    >

                                        {!isUnlocked ? <Lock size={14} /> : (difficulty !== level && <LockOpen size={14} style={{ opacity: 0.7 }} />)}
                                        {t.common.difficulty[level]}
                                    </button>
                                );
                            })}
                        </div>
                        <button className="start-btn-quiz" onClick={startQuiz}>
                            {t.quiz.startBtn}
                        </button>
                    </div>
                )}

                {gameState === "playing" && (
                    <div className="playing-screen-quiz">
                        <div className="game-info-bar-quiz">
                            <div className="quiz-info">
                                <span style={{ fontWeight: 600 }}>{t.quiz.questionCount} {currentIdx + 1} / 10</span>
                                <span style={{ marginLeft: '12px', fontSize: '0.8rem', padding: '4px 10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '20px', color: '#3b82f6' }}>{t.common.difficulty[difficulty]}</span>
                            </div>
                            <div className={`timer-quiz ${timeLeft < 10 ? "low" : ""}`}>
                                <Timer size={18} />
                                <span>{timeLeft}s</span>
                            </div>
                        </div>

                        <div className="progress-bar-container-quiz">
                            <div className="progress-fill-quiz" style={{ width: `${((currentIdx) / 10) * 100}%` }}></div>
                        </div>

                        <div className="question-card-quiz">
                            <h3>{questions[currentIdx]?.question}</h3>
                            <div className="options-grid-quiz">
                                {questions[currentIdx]?.options.map((opt, idx) => {
                                    let statusClass = "";
                                    if (isAnswered) {
                                        if (idx === questions[currentIdx].correctIndex) statusClass = "correct";
                                        else if (idx === selectedAnswer) statusClass = "wrong";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(idx)}
                                            disabled={isAnswered}
                                            className={`option-btn-quiz ${statusClass} ${selectedAnswer === idx ? "selected" : ""}`}
                                        >
                                            <span className="opt-letter-quiz">{String.fromCharCode(65 + idx)}</span>
                                            <span>{opt}</span>
                                            {isAnswered && idx === questions[currentIdx].correctIndex && <CheckCircle2 size={18} style={{ marginLeft: 'auto', color: '#22c55e' }} />}
                                            {isAnswered && idx === selectedAnswer && idx !== questions[currentIdx].correctIndex && <XCircle size={18} style={{ marginLeft: 'auto', color: '#ef4444' }} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {gameState === "finished" && (
                    <div className="quiz-completion-overlay animated fadeIn">
                        <div className="quiz-completion-card">
                            <div className="completion-icon">🏆</div>
                            <h2>{t.quiz.completion.title}</h2>
                            <p>
                                {t.quiz.completion.desc.replace("{difficulty}", t.common.difficulty[difficulty])}
                            </p>
                            <div className="score-circle-quiz">
                                <span className="score-num-quiz">{score}</span>
                                <span className="score-total-quiz">/ 10</span>
                            </div>
                            <div className="completion-stats">
                                <div className="stat-pill">
                                    {t.quiz.completion.points}: {score * (difficulty === "Hard" ? 10 : difficulty === "Medium" ? 7 : 5)}
                                </div>
                                <div className="stat-pill">
                                    {t.quiz.completion.diff}: {t.common.difficulty[difficulty]}
                                </div>
                            </div>
                            <div className="result-actions-quiz">
                                <button onClick={resetQuiz} className="continue-btn-quiz">
                                    <RotateCcw size={18} /> {t.quiz.completion.playAgain}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
