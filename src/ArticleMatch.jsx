import React, { useState, useEffect } from "react";
import { useLanguage } from "./context/LanguageContext";
import "./ArticleMatch.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Brain, RotateCcw, Timer, Trophy } from "lucide-react";
import config from "./config";

export default function ArticleMatch() {
    const { t } = useLanguage();
    const [gameState, setGameState] = useState("start"); // start, playing, won
    const [difficulty, setDifficulty] = useState("Easy"); // Easy, Medium, Hard
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [timer, setTimer] = useState(0);

    // Difficulty Config
    const diffConfig = {
        Easy: { pairs: 4, grid: "grid-4" },
        Medium: { pairs: 6, grid: "grid-6" },
        Hard: { pairs: 8, grid: "grid-8" }
    };

    // Timer Effect
    useEffect(() => {
        let interval;
        if (gameState === "playing") {
            interval = setInterval(() => setTimer(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [gameState]);

    const startGame = () => {
        const pairCount = diffConfig[difficulty].pairs;
        // Get pairs from translations to ensure language refresh
        const allPairs = t.articleMatch.pairs;

        // Shuffle and slice pairs
        const selectedPairs = [...allPairs]
            .sort(() => 0.5 - Math.random())
            .slice(0, pairCount);

        // Create cards: 2 for each pair (Article & Meaning)
        const deck = [];
        selectedPairs.forEach((pair) => {
            // Card type 1: Article Name
            deck.push({
                id: `a-${pair.id}`,
                pairId: pair.id,
                content: pair.article,
                type: 'article',
                icon: '📜'
            });
            // Card type 2: Meaning
            deck.push({
                id: `m-${pair.id}`,
                pairId: pair.id,
                content: pair.mean,
                type: 'meaning',
                icon: '💡'
            });
        });

        // Shuffle deck
        setCards(deck.sort(() => 0.5 - Math.random()));
        setFlipped([]);
        setMatched([]);
        setMoves(0);
        setTimer(0);
        setGameState("playing");
    };

    const handleCardClick = (id) => {
        // Prevent clicking if 2 cards flipped match animation logic, or already matched/flipped
        if (flipped.length === 2 || matched.includes(id) || flipped.includes(id)) return;

        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1);
            const [id1, id2] = newFlipped;
            const card1 = cards.find(c => c.id === id1);
            const card2 = cards.find(c => c.id === id2);

            if (card1.pairId === card2.pairId) {
                // Match found
                setMatched(prev => [...prev, id1, id2]);
                setFlipped([]);

                // Check Win
                if (matched.length + 2 === cards.length) {
                    setTimeout(() => {
                        setGameState("won");
                        updateProgress();
                    }, 500);
                }
            } else {
                // No match - flip back after delay
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
                    gameId: "articleMatch"
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
                        <div className="difficulty-options">
                            {Object.keys(diffConfig).map((lvl) => (
                                <button
                                    key={lvl}
                                    className={`diff-btn ${difficulty === lvl ? "active" : ""}`}
                                    onClick={() => setDifficulty(lvl)}
                                >
                                    {t.common.difficulty[lvl] || lvl}
                                    <span style={{ fontSize: '0.8em', display: 'block', opacity: 0.8 }}>
                                        ({diffConfig[lvl].pairs} Pairs)
                                    </span>
                                </button>
                            ))}
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
                                        className={`memory-card ${isFlipped ? "flipped" : ""} ${matched.includes(card.id) ? "matched" : ""}`}
                                        onClick={() => handleCardClick(card.id)}
                                    >
                                        <div className="card-face card-front">
                                            <Brain size={32} strokeWidth={1.5} />
                                            <span style={{ marginTop: '8px', fontSize: '0.8rem' }}>Click to flip</span>
                                        </div>
                                        <div className="card-face card-back">
                                            <div className="card-icon">{card.icon}</div>
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
