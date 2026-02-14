import { useState, useEffect } from "react";
import cardData from "./data/cards.json";
import "./ConstitutionCards.css";
import Navbar from './Navbar';
import Footer from './Footer';
import { useLanguage } from './context/LanguageContext';
import config from "./config";
import { Lock, LockOpen, RotateCcw } from "lucide-react";

export default function ConstitutionCards() {
    const { t, language } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [knewCount, setKnewCount] = useState(0);
    const [learnedCount, setLearnedCount] = useState(0);
    const [assessedCards, setAssessedCards] = useState([]);
    const [isLevelComplete, setIsLevelComplete] = useState(false);
    const [popup, setPopup] = useState({ show: false, message: "", type: "" });
    const [difficulty, setDifficulty] = useState("Easy");
    const [unlockedLevels, setUnlockedLevels] = useState(["Easy"]);
    const [cards, setCards] = useState([]);

    const currentCard = cards[currentIndex];

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
        const filtered = cardData.filter(c => c.difficulty === difficulty);
        const pool = filtered.length > 0 ? filtered : cardData;
        setCards([...pool].sort(() => 0.5 - Math.random()));
        setCurrentIndex(0);
        setFlipped(false);
        setKnewCount(0);
        setLearnedCount(0);
        setAssessedCards([]);
        setIsLevelComplete(false);
    }, [difficulty]);

    const resetLevel = () => {
        setCurrentIndex(0);
        setFlipped(false);
        setKnewCount(0);
        setLearnedCount(0);
        setAssessedCards([]);
        setIsLevelComplete(false);
    };

    // Helper to get translated content
    const getCardContent = () => {
        if (!currentCard) return { q: "", a: "" };
        if (language === 'hi' && t.cards.questions && t.cards.questions[currentCard.id]) {
            return t.cards.questions[currentCard.id];
        }
        return { q: currentCard.question, a: currentCard.answer };
    };

    const content = getCardContent();
    // Use translated category if available, otherwise fallback to English category
    // Note: translations.js doesn't seem to have categories mapped yet, so we keep English or map simpler ones if needed.
    // For now we will stick to English category or simple static mapping if requested later.

    const nextCard = () => {
        setFlipped(false);
        setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
    };

    const prevCard = () => {
        setFlipped(false);
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
    };

    const handleAssessment = (type) => {
        if (assessedCards.includes(currentCard.id)) return;

        const knewMessages = [
            "You're a genius! 🧠",
            "Constitution Master! ⭐",
            "Impressive knowledge! 👏",
            "Keep it up, legal eagle! 🦅"
        ];
        const learnedMessages = [
            "Great to learn something new! 💡",
            "Knowledge is power! 💪",
            "Well learned! 📝",
            "Expanding your horizon! 🌅"
        ];

        if (type === 'knew') setKnewCount(prev => prev + 1);
        else setLearnedCount(prev => prev + 1);

        const newAssessed = [...assessedCards, cards[currentIndex].id];
        setAssessedCards(newAssessed);

        const popupMsg = type === 'knew' ? knewMessages[Math.floor(Math.random() * knewMessages.length)] : learnedMessages[Math.floor(Math.random() * learnedMessages.length)];
        setPopup({ show: true, message: popupMsg, type });
        setTimeout(() => setPopup({ show: false, message: '', type: '' }), 2000);

        if (newAssessed.length === cards.length) {
            setTimeout(() => {
                setIsLevelComplete(true);
                updateProgress();
            }, 1000);
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
                    totalPoints: difficulty === "Hard" ? 40 : (difficulty === "Medium" ? 25 : 10),
                    gameId: "constitutionCards",
                    completedLevel: difficulty,
                    mastery: { [cards[0]?.category.toLowerCase()]: 10 }
                })
            });
        } catch (e) {
            console.error("Failed to update progress", e);
        }
    };

    return (
        <>
            <section>
                <Navbar />
            </section>
            <main className="page10">
                <header className="header10">
                    <button onClick={() => window.history.back()} className="back-btn10">←</button>
                    <div>
                        <h1>📚 {t.cards.title}</h1>
                        <p>{t.cards.desc}</p>
                    </div>
                </header>
                <div className="container10">
                    <div className="diff-selection" style={{ marginBottom: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
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

                    {/* Progress */}
                    <div className="progress-header10">
                        <span>
                            {language === 'hi' ? `कार्ड ${currentIndex + 1} / ${cards.length}` : `Card ${currentIndex + 1} of ${cards.length}`}
                        </span>
                        <div className="stats10">
                            <span className="pill10 knew10">✨ {knewCount} {t.cards.knew}</span>
                            <span className="pill10 learned10">💡 {learnedCount} {t.cards.learned}</span>
                        </div>
                    </div>


                    <div className="progress-bar10">
                        <div
                            className="progress-fill10"
                            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                        />
                    </div>

                    {/* Flashcard */}
                    {currentCard && (
                        <div className="card-wrapper10" onClick={() => setFlipped(!flipped)}>
                            <div className={`card10 ${flipped ? "flipped10" : ""}`}>
                                {/* Front */}
                                <div className="card-face10 card-front10">
                                    <span className="tag10">{currentCard.category}</span>
                                    <div className="icon10">📖</div>
                                    <h2>{content.q}</h2>
                                    <p className="hint10">{t.cards.flip}</p>
                                </div>

                                {/* Back */}
                                <div className="card-face10 card-back10">
                                    <span className="tag10">{currentCard.category}</span>
                                    <p className="answer10">{content.a}</p>

                                    <div className="fact10">
                                        💡 Tip: This question belong to <b>{currentCard.category}</b>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {flipped && currentCard && (
                        <div className="actions10">
                            <button
                                className="btn10 secondary10"
                                onClick={() => handleAssessment('learned')}
                                disabled={assessedCards.includes(currentCard.id)}
                                style={{ opacity: assessedCards.includes(currentCard.id) ? 0.5 : 1 }}
                            >
                                💡 {t.cards.learned}
                            </button>
                            <button
                                className="btn10 primary10"
                                onClick={() => handleAssessment('knew')}
                                disabled={assessedCards.includes(currentCard.id)}
                                style={{ opacity: assessedCards.includes(currentCard.id) ? 0.5 : 1 }}
                            >
                                ✨ {t.cards.knew}
                            </button>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="navigation10">
                        <button onClick={prevCard} disabled={currentIndex === 0}>
                            ‹ {t.cards.prev}
                        </button>
                        <span>
                            {currentIndex + 1} / {cards.length}
                        </span>
                        <button onClick={nextCard} disabled={currentIndex === cards.length - 1}>
                            {t.cards.next} ›
                        </button>
                    </div>

                    {/* Completion Overlay */}
                    {isLevelComplete && (
                        <div className="cards-completion-overlay animated fadeIn">
                            <div className="cards-completion-card">
                                <div className="completion-icon">🏆</div>
                                <h2>{language === 'hi' ? 'स्तर पूरा हुआ!' : 'Level Completed!'}</h2>
                                <p>
                                    {language === 'hi'
                                        ? `आपने ${t.common.difficulty[difficulty]} मोड में सभी ${cards.length} कार्ड सफलतापूर्वक पूरे कर लिए हैं।`
                                        : `You've successfully completed all ${cards.length} cards in ${t.common.difficulty[difficulty]} mode.`}
                                </p>
                                <div className="completion-stats">
                                    <span className="pill10 knew10">✨ {knewCount} {t.cards.knew}</span>
                                    <span className="pill10 learned10">💡 {learnedCount} {t.cards.learned}</span>
                                </div>
                                <button className="continue-btn-cards" onClick={resetLevel}>
                                    <RotateCcw size={18} /> {language === 'hi' ? 'फिर से खेलें' : 'Play Again'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Popup Message */}
                    {popup.show && (
                        <div className={`feedback-popup10 ${popup.type}`}>
                            {popup.message}
                        </div>
                    )}
                </div>
            </main >
            <section>
                <Footer />
            </section>
        </>
    );
}
