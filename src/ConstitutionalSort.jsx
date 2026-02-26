import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "./context/LanguageContext";
import "./ConstitutionalSort.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Brain, RotateCcw, Timer, Trophy, Lock, LockOpen, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import config from "./config";

export default function ConstitutionalSort() {
    const { t } = useLanguage();
    const location = useLocation();
    const [gameState, setGameState] = useState("start"); // start, playing, won, lost
    const [difficulty, setDifficulty] = useState("Easy");
    const [unlockedLevels, setUnlockedLevels] = useState(["Easy"]);
    const [items, setItems] = useState([]);
    const [placedItems, setPlacedItems] = useState({});
    const [timer, setTimer] = useState(90);
    const [score, setScore] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [touchItem, setTouchItem] = useState(null);
    const [touchPos, setTouchPos] = useState({ x: 0, y: 0 });
    const timerRef = useRef(null);
    const scrollRef = useRef(null);
    const touchItemRef = useRef(null);
    const touchPosRef = useRef({ x: 0, y: 0 });
    const gameItemCountRef = useRef(0);

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

    useEffect(() => {
        if (gameState === "playing") {
            timerRef.current = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setGameState("lost");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [gameState]);

    const startGame = () => {
        const queryParams = new URLSearchParams(location.search);
        const selectedCat = queryParams.get("category");

        const itemCountByDifficulty = { Easy: 10, Medium: 12, Hard: 15 };
        const itemCount = itemCountByDifficulty[difficulty];

        let difficultyItems = t.constitutionalSort.items[difficulty];

        if (selectedCat) {
            difficultyItems = difficultyItems.filter(i => i.category === selectedCat);
        }

        // Shuffle then pick only the required number of items
        const shuffled = [...difficultyItems].sort(() => 0.5 - Math.random());
        const selectedItems = shuffled.slice(0, itemCount);

        gameItemCountRef.current = selectedItems.length;
        setItems(selectedItems);
        setPlacedItems({});
        setScore(0);
        setWrongCount(0);
        setTimer(difficulty === "Hard" ? 45 : difficulty === "Medium" ? 60 : 90);
        setGameState("playing");
    };

    const handleDragStart = (e, item) => {
        e.dataTransfer.setData("item", JSON.stringify(item));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add("drag-over");
    };

    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove("drag-over");
    };

    const handleDrop = (e, targetCategory) => {
        e.preventDefault();
        e.currentTarget.classList.remove("drag-over");
        const itemData = e.dataTransfer.getData("item");
        if (!itemData) return;
        const item = JSON.parse(itemData);

        // Remove from current category if it was already placed
        setPlacedItems((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach(cat => {
                updated[cat] = updated[cat].filter(i => i.id !== item.id);
            });
            // Add to new category
            updated[targetCategory] = [...(updated[targetCategory] || []), item];
            return updated;
        });

        // Remove from pool if it was there
        setItems((prev) => prev.filter((i) => i.id !== item.id));
    };

    const handleReturnToPool = (e) => {
        e.preventDefault();
        const itemData = e.dataTransfer.getData("item");
        if (!itemData) return;
        const item = JSON.parse(itemData);

        // Remove from categories
        setPlacedItems((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach(cat => {
                updated[cat] = updated[cat].filter(i => i.id !== item.id);
            });
            return updated;
        });

        // Add back to pool if not already there
        setItems((prev) => {
            if (prev.find(i => i.id === item.id)) return prev;
            return [...prev, item];
        });
    };

    const handleSubmit = () => {
        let correctCount = 0;
        let incorrectCount = 0;

        Object.keys(placedItems).forEach(cat => {
            placedItems[cat].forEach(item => {
                if (item.category === cat) {
                    correctCount++;
                } else {
                    incorrectCount++;
                }
            });
        });

        const finalScore = correctCount * 10;
        setScore(finalScore);
        setWrongCount(incorrectCount);
        setGameState("won");
        updateProgress(finalScore);
    };

    const handleTouchStart = (e, item) => {
        // Prevent default to ensure our drag logic takes over
        if (e.cancelable) e.preventDefault();
        const touch = e.touches[0];
        setTouchItem(item);
        setTouchPos({ x: touch.clientX, y: touch.clientY });
        touchItemRef.current = item;
        touchPosRef.current = { x: touch.clientX, y: touch.clientY };
        startAutoScroll();
    };

    const startAutoScroll = () => {
        if (scrollRef.current) return;
        const scroll = () => {
            if (!touchItemRef.current) {
                stopAutoScroll();
                return;
            }

            const threshold = 150;
            const maxSpeed = 500; // Significantly faster
            const y = touchPosRef.current.y;
            const x = touchPosRef.current.x;
            const height = window.innerHeight;

            let scrolled = false;
            if (y < threshold) {
                const speed = Math.max(15, (1 - y / threshold) * maxSpeed);
                window.scrollBy(0, -speed);
                scrolled = true;
            } else if (y > height - threshold) {
                const speed = Math.max(15, (1 - (height - y) / threshold) * maxSpeed);
                window.scrollBy(0, speed);
                scrolled = true;
            }

            if (scrolled) {
                // If we scrolled, re-run detection even if finger didn't move
                updateDropZoneDetection(x, y);
            }

            scrollRef.current = requestAnimationFrame(scroll);
        };
        scrollRef.current = requestAnimationFrame(scroll);
    };

    const updateDropZoneDetection = (x, y) => {
        const target = document.elementFromPoint(x, y);
        const zone = target?.closest('.category-zone') || target?.closest('.items-pool');

        document.querySelectorAll('.category-zone, .items-pool').forEach(el => el.classList.remove('drag-over'));
        if (zone) zone.classList.add('drag-over');
    };

    const stopAutoScroll = () => {
        if (scrollRef.current) {
            cancelAnimationFrame(scrollRef.current);
            scrollRef.current = null;
        }
    };

    const handleTouchMove = (e) => {
        if (!touchItemRef.current) return;
        if (e.cancelable) e.preventDefault(); // Crucial for mobile auto-scroll
        const touch = e.touches[0];
        const newPos = { x: touch.clientX, y: touch.clientY };
        setTouchPos(newPos);
        touchPosRef.current = newPos;

        updateDropZoneDetection(newPos.x, newPos.y);
    };

    const handleTouchEnd = (e) => {
        const itemToPlace = touchItemRef.current;
        if (!itemToPlace) return;

        const touch = e.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const categoryZone = target?.closest('.category-zone');
        const poolZone = target?.closest('.items-pool');

        // Cleanup feedback
        document.querySelectorAll('.category-zone, .items-pool').forEach(el => el.classList.remove('drag-over'));

        if (categoryZone) {
            const targetCategory = categoryZone.getAttribute('data-category');
            if (targetCategory) {
                setPlacedItems((prev) => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(cat => {
                        updated[cat] = updated[cat].filter(i => i.id !== itemToPlace.id);
                    });
                    updated[targetCategory] = [...(updated[targetCategory] || []), itemToPlace];
                    return updated;
                });
                setItems((prev) => prev.filter((i) => i.id !== itemToPlace.id));
            }
        } else if (poolZone) {
            // Return to pool
            setPlacedItems((prev) => {
                const updated = { ...prev };
                Object.keys(updated).forEach(cat => {
                    updated[cat] = updated[cat].filter(i => i.id !== itemToPlace.id);
                });
                return updated;
            });
            setItems((prev) => {
                if (prev.find(i => i.id === itemToPlace.id)) return prev;
                return [...prev, itemToPlace];
            });
        }

        setTouchItem(null);
        touchItemRef.current = null;
        stopAutoScroll();
    };

    const updateProgress = async (finalScore) => {
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
                    totalPoints: finalScore || (difficulty === "Hard" ? 50 : (difficulty === "Medium" ? 30 : 15)),
                    gameId: "sort",
                    completedLevel: difficulty,
                    mastery: { legislature: 5, executive: 5, judiciary: 5 }
                })
            });
        } catch (e) {
            console.error("Failed to update progress", e);
        }
    };

    // Derive categories from the active set of items (pool + already placed)
    const allActiveItems = [
        ...items,
        ...Object.values(placedItems).flat()
    ];
    const categories = allActiveItems.length > 0
        ? Array.from(new Set(allActiveItems.map(i => i.category)))
        : Array.from(new Set(t.constitutionalSort.items[difficulty].map(i => i.category)));

    return (
        <>
            <section className="section1">
                <Navbar />
            </section>
            <main className="sort-container">
                <header className="sort-header">
                    <button onClick={() => window.history.back()} className="back-btn">←</button>
                    <div>
                        <h1>⫽ {t.constitutionalSort.title}</h1>
                        <p>{t.constitutionalSort.desc}</p>
                    </div>
                </header>

                {gameState === "start" && (
                    <div className="start-screen">
                        <div className="icon-wrapper">⫽</div>
                        <h2>{t.constitutionalSort.title}</h2>
                        <p style={{ fontFamily: "sans-serif", marginBottom: "20px", fontSize: ".9rem", maxWidth: "80%", color: "grey" }}>
                            {t.constitutionalSort.desc}
                        </p>
                        <h4>{t.constitutionalSort.difficulty}</h4>
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
                            {t.constitutionalSort.startGame}
                        </button>
                    </div>
                )}

                {(gameState === "playing" || gameState === "won" || gameState === "lost") && (
                    <div className="Container-box-sort">
                        <div className="game-info-bar">
                            <div className={`info-item ${timer <= 10 ? 'timer-critical' : ''}`}>
                                <Timer size={18} /> {timer}s
                            </div>
                            <div className="info-item">
                                {t.constitutionalSort.score}: {score}
                            </div>
                            <button className="restart-btn" onClick={() => setGameState("start")}>
                                <RotateCcw size={16} /> {t.constitutionalSort.restart}
                            </button>
                        </div>

                        <div className="game-area">
                            <aside
                                className="items-pool"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleReturnToPool}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="sort-item"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, item)}
                                        onTouchStart={(e) => handleTouchStart(e, item)}
                                    >
                                        <Sparkles size={16} />
                                        {item.text}
                                    </div>
                                ))}
                                {items.length === 0 && (
                                    <button className="submit-game-btn animated pulse" onClick={handleSubmit}>
                                        <CheckCircle2 size={20} /> {t.constitutionalSort.submit}
                                    </button>
                                )}
                            </aside>

                            <section className="categories-grid">
                                {categories.map((cat) => (
                                    <div
                                        key={cat}
                                        className="category-zone"
                                        data-category={cat}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, cat)}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleTouchEnd}
                                    >
                                        <h3>{t.constitutionalSort.categoryLabels[cat] || cat}</h3>
                                        <div className="placed-items">
                                            {(placedItems[cat] || []).map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="placed-item"
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, item)}
                                                    onTouchStart={(e) => handleTouchStart(e, item)}
                                                >
                                                    {item.text}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </section>
                        </div>
                    </div>
                )}

                {/* Win Modal */}
                {gameState === "won" && (
                    <div className="win-overlay animated fadeIn">
                        <div className="win-card">
                            <div className="completion-icon">🏆</div>
                            <h2>{t.constitutionalSort.wellDone}</h2>
                            <p>{t.constitutionalSort.wellDoneDesc}</p>
                            <div className="win-stats">
                                <div className="stat-pill">
                                    <Timer size={16} /> {(difficulty === "Hard" ? 45 : difficulty === "Medium" ? 60 : 90) - timer}s used
                                </div>
                                <div className="stat-pill" style={{ color: '#22c55e' }}>
                                    <CheckCircle2 size={16} /> {score / 10}
                                </div>
                                <div className="stat-pill" style={{ color: '#ef4444' }}>
                                    <AlertCircle size={16} /> {wrongCount}
                                </div>
                                <div className="stat-pill">
                                    Points: {score}
                                </div>
                            </div>
                            <button className="play-again-btn" onClick={() => setGameState("start")}>
                                {t.constitutionalSort.playAgain}
                            </button>
                        </div>
                    </div>
                )}

                {/* Game Over Modal */}
                {gameState === "lost" && (
                    <div className="win-overlay animated fadeIn">
                        <div className="win-card">
                            <div className="completion-icon" style={{ filter: 'grayscale(1)' }}>⏰</div>
                            <h2>{t.constitutionalSort.gameOver}</h2>
                            <p>{t.constitutionalSort.gameOverDesc}</p>
                            <div className="win-stats">
                                <div className="stat-pill">
                                    Remaining: {items.length} items
                                </div>
                            </div>
                            <button className="play-again-btn" onClick={startGame}>
                                {t.constitutionalSort.playAgain}
                            </button>
                        </div>
                    </div>
                )}

                {/* Touch Ghost Element */}
                {touchItem && (
                    <div
                        className="touch-ghost"
                        style={{
                            left: `${touchPos.x}px`,
                            top: `${touchPos.y}px`
                        }}
                    >
                        <Sparkles size={16} />
                        {touchItem.text}
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
