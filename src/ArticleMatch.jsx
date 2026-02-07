import React, { useState, useEffect } from "react";
import { useLanguage } from "./context/LanguageContext";
import "./ArticleMatch.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Brain, RotateCcw, Timer, Trophy, Lock, LockOpen, Sparkles } from "lucide-react";
import config from "./config";

const diffConfig = {
    Easy: { pairs: 4, grid: "grid-4" },
    Medium: { pairs: 6, grid: "grid-6" },
    Hard: { pairs: 8, grid: "grid-8" }
};

export default function ArticleMatch() {
    const { t } = useLanguage();
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
            if (!email) return;
            try {
                const res = await fetch(`${config.API_URL}/api/progress/${email}`, {
                    headers: { "ngrok-skip-browser-warning": "true" }
                });
                if (res.ok) {
                    const data = await res.json();
                    const allGames = ["articleMatch", "rightsDutiesClimb", "constitutionCards"];
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
        const pairCount = diffConfig[difficulty].pairs;
        // Filter pairs by difficulty or just take from current pool
        const allPairs = t.articleMatch.pairs.filter(p => p.difficulty === difficulty);

        // If not enough pairs for specific difficulty, fallback to all but warn
        const pool = allPairs.length >= pairCount ? allPairs : t.articleMatch.pairs;

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
        if (!email) return;

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
                    completedLevel: difficulty
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
                        <h1>{t.articleMatch.title}</h1>
                        <p>{t.articleMatch.desc}</p>
                    </div>
                </header>

                {gameState === "start" && (
                    <div className="start-screen">
                        <div className="icon-wrapper"><Brain size={40} /></div>
                        <h2>{t.articleMatch.startTitle}</h2>
                        <p style={{ fontFamily: "sans-serif", marginBottom: "20px", fontSize: ".9rem", maxWidth: "80%", color: "grey" }}>{t.articleMatch.startDesc}</p>
                        <h4>{t.articleMatch.difficulty}</h4>
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
                            {t.articleMatch.startGame}
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
                                Moves: {moves}
                            </div>
                            <button className="restart-btn" onClick={() => setGameState("start")}>
                                <RotateCcw size={16} /> {t.articleMatch.restart}
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
                                            <span style={{ marginTop: '8px', fontSize: '0.8rem' }}>Click to flip</span>
                                        </div>
                                        <div className="card-face card-back">
                                            <div className="card-header-row">
                                                <div className={`card-badge ${card.type}`}>
                                                    {card.type === 'article' ? `📜 ${t.articleMatch.article}` : `💡 ${t.articleMatch.meaning}`}
                                                </div>
                                                {matched.includes(card.id) && <Sparkles className="sparkle-icon" size={20} />}
                                            </div>
                                            <div className="card-text">{card.content}</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="tip-box">
                            {t.articleMatch.tip}
                        </div>
                    </div>
                )}

                {/* Win Modal */}
                {gameState === "won" && (
                    <div className="win-modal">
                        <div className="win-content">
                            <span className="win-icon">🎉</span>
                            <h2>{t.articleMatch.wellDone}</h2>
                            <p style={{ margin: '1rem 0', color: '#64748b' }}>
                                You matched all {diffConfig[difficulty].pairs} pairs in {moves} moves!
                            </p>
                            <div className="game-meta" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <span className="time">⏱ {formatTime(timer)}</span>
                            </div>
                            <button className="start-btn" onClick={() => setGameState("start")}>
                                {t.articleMatch.playAgain}
                            </button>
                        </div>
                    </div>
                )}

            </main>
            <Footer />
        </>
    );
}
