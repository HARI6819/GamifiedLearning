import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "./context/LanguageContext";
import "./ArticleMatch.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Brain, RotateCcw, Timer, Trophy, Lock, LockOpen, Sparkles } from "lucide-react";
import config from "./config";
import articleMatchQuestionsLocal from "./data/articleMatchQuestions.json";
import { useGameQuestions } from "./hooks/useGameQuestions";
import TranslatedText from "./TranslatedText";

const diffConfig = {
    Easy: { pairs: 4, grid: "grid-4" },
    Medium: { pairs: 6, grid: "grid-6" },
    Hard: { pairs: 8, grid: "grid-8" }
};

export default function ArticleMatch() {
    const { t } = useLanguage();
    const location = useLocation();
    const { data: articleMatchQuestions } = useGameQuestions("articleMatch", articleMatchQuestionsLocal, true);
    const [gameState, setGameState] = useState("start"); // start, playing, won
    const [difficulty, setDifficulty] = useState("Easy"); // Easy, Medium, Hard
    const [unlockedLevels, setUnlockedLevels] = useState(["Easy"]);
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        let interval;
        if (gameState === "playing") {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState]);

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

    const startGame = () => {
        const queryParams = new URLSearchParams(location.search);
        const selectedCat = queryParams.get("category");
        const pairCount = diffConfig[difficulty].pairs;

        // Filter pairs by difficulty and category
        let allPairs = articleMatchQuestions.filter(p => p.difficulty === difficulty);

        if (selectedCat) {
            allPairs = allPairs.filter(p => p.category === selectedCat);
        }

        // If not enough pairs for specific difficulty, fallback to all but warn
        const pool = allPairs.length >= pairCount ? allPairs : articleMatchQuestions;

        const selectedPairs = [...pool]
            .sort(() => 0.5 - Math.random())
            .slice(0, pairCount);

        const deck = [];
        selectedPairs.forEach((pair) => {
            deck.push({
                id: `a-${pair.id}`,
                pairId: pair.id,
                content: pair.article,
                type: 'article',
                icon: '📜'
            });
            deck.push({
                id: `m-${pair.id}`,
                pairId: pair.id,
                content: pair.mean,
                type: 'meaning',
                icon: '💡'
            });
        });

        setCards(deck.sort(() => 0.5 - Math.random()));
        setFlipped([]);
        setMatched([]);
        setMoves(0);
        setTimer(0);
        setGameState("playing");
    };

    const handleCardClick = (id) => {
        if (flipped.length === 2 || matched.includes(id) || flipped.includes(id)) return;

        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1);
            const [id1, id2] = newFlipped;
            const card1 = cards.find(c => c.id === id1);
            const card2 = cards.find(c => c.id === id2);

            if (card1.pairId === card2.pairId) {
                setMatched(prev => {
                    const updatedMatched = [...prev, id1, id2];
                    if (updatedMatched.length === cards.length) {
                        setTimeout(() => {
                            setGameState("won");
                            updateProgress();
                        }, 500);
                    }
                    return updatedMatched;
                });
                setFlipped([]);
            } else {
                setTimeout(() => setFlipped([]), 1000);
            }
        }
    };

    const updateProgress = async () => {
        const email = localStorage.getItem('userEmail');
        const isGuest = localStorage.getItem('isGuest') === 'true';
        console.log("ArticleMatch updateProgress check:", { email, isGuest });
        if (!email || isGuest) {
            if (isGuest) console.log("Guest mode detected in ArticleMatch, skipping API update.");
            return;
        }

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
                    totalPoints: difficulty === "Hard" ? 50 : (difficulty === "Medium" ? 30 : 15),
                    gameId: "articleMatch",
                    completedLevel: difficulty,
                    mastery: { legislature: 5, executive: 5, judiciary: 5 }
                })
            });
        } catch (e) {
            console.error("Failed to update progress", e);
        }
    };

    const formatTime = (s) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <>
            <section className="section1">
                <Navbar />
            </section>
            <main className="match-container">
                {/* Header */}
                <header className="match-header">
                    <button onClick={() => window.history.back()} className="back-btn">←</button>
                    <div>
                        <h1>🎴<TranslatedText>{t.articleMatch.title}</TranslatedText></h1>
                        <p><TranslatedText>{t.articleMatch.desc}</TranslatedText></p>
                    </div>
                </header>

                {gameState === "start" && (
                    <div className="start-screen">
                        <div className="icon-wrapper"> 🎴</div>
                        <h2><TranslatedText>{t.articleMatch.startTitle}</TranslatedText></h2>
                        <p style={{ fontFamily: "sans-serif", marginBottom: "20px", fontSize: ".9rem", maxWidth: "80%", color: "grey" }}><TranslatedText>{t.articleMatch.startDesc}</TranslatedText></p>
                        <h4><TranslatedText>{t.articleMatch.difficulty}</TranslatedText></h4>
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
                                        <TranslatedText>{t.common.difficulty[level]}</TranslatedText>
                                    </button>
                                );
                            })}
                        </div>
                        <button className="start-btn" onClick={startGame}>
                            <TranslatedText>{t.articleMatch.startGame}</TranslatedText>
                        </button>
                    </div>
                )}

                {gameState !== "start" && (
                    <div>
                        {/* Info Bar */}
                        <div className="game-info-bar">
                            <div className="info-item">
                                <Timer size={16} /> {formatTime(timer)}
                            </div>
                            <div className="info-item">
                                <TranslatedText>Moves</TranslatedText>: {moves}
                            </div>
                            <button className="restart-btn" onClick={() => setGameState("start")}>
                                <RotateCcw size={16} /> <TranslatedText>{t.articleMatch.restart}</TranslatedText>
                            </button>
                        </div>

                        {/* Grid */}
                        <div className={`cards-grid ${diffConfig[difficulty].grid}`}>
                            {cards.map(card => {
                                const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
                                return (
                                    <div
                                        key={card.id}
                                        className={`memory-card ${isFlipped ? "flipped" : ""} ${matched.includes(card.id) ? "matched" : ""} type-${card.type}`}
                                        onClick={() => handleCardClick(card.id)}
                                    >
                                        <div className="card-face card-front">
                                            <Brain size={32} strokeWidth={1.5} />
                                            <span style={{ marginTop: '8px', fontSize: '0.8rem' }}><TranslatedText>Click to flip</TranslatedText></span>
                                        </div>
                                        <div className="card-face card-back">
                                            <div className="card-header-row">
                                                <div className={`card-badge ${card.type}`}>
                                                    {card.type === 'article' ? (
                                                        <>📜 <TranslatedText>{t.articleMatch.article}</TranslatedText></>
                                                    ) : (
                                                        <>💡 <TranslatedText>{t.articleMatch.meaning}</TranslatedText></>
                                                    )}
                                                </div>
                                                {matched.includes(card.id) && <Sparkles className="sparkle-icon" size={20} />}
                                            </div>
                                            <div className="card-text"><TranslatedText>{card.content}</TranslatedText></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="tip-box">
                            <TranslatedText>{t.articleMatch.tip}</TranslatedText>
                        </div>
                    </div>
                )}

                {/* Win Modal */}
                {gameState === "won" && (
                    <div className="article-completion-overlay animated fadeIn">
                        <div className="article-completion-card">
                            <div className="completion-icon">🏆</div>
                            <h2><TranslatedText>{t.articleMatch.wellDone}</TranslatedText></h2>
                            <p>
                                <TranslatedText>{t.articleMatch.wellDoneDesc || `You've matched all ${diffConfig[difficulty].pairs} pairs successfully!`}</TranslatedText>
                            </p>
                            <div className="completion-stats">
                                <div className="stat-pill">
                                    <Timer size={16} /> {formatTime(timer)}
                                </div>
                                <div className="stat-pill">
                                    <TranslatedText>Moves</TranslatedText>: {moves}
                                </div>
                            </div>
                            <button className="continue-btn-article" onClick={() => setGameState("start")}>
                                <TranslatedText>{t.articleMatch.playAgain}</TranslatedText>
                            </button>
                        </div>
                    </div>
                )}

            </main>
            <Footer />
        </>
    );
}
