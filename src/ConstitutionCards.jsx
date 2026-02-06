import { useState } from "react";
import cards from "./data/cards.json";
import "./ConstitutionCards.css";
import Navbar from './Navbar';
import Footer from './Footer';
import { useLanguage } from './context/LanguageContext';
import config from "./config";

export default function ConstitutionCards() {
    const { t, language } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [knewCount, setKnewCount] = useState(0);
    const [learnedCount, setLearnedCount] = useState(0);
    const [assessedCards, setAssessedCards] = useState([]);
    const [popup, setPopup] = useState({ show: false, message: "", type: "" });

    const currentCard = cards[currentIndex];

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

        const messages = type === 'knew' ? knewMessages : learnedMessages;
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];

        setPopup({ show: true, message: randomMsg, type });
        setTimeout(() => setPopup(prev => ({ ...prev, show: false })), 2000);

        if (type === 'knew') setKnewCount(prev => prev + 1);
        if (type === 'learned') setLearnedCount(prev => prev + 1);

        const newAssessed = [...assessedCards, currentCard.id];
        setAssessedCards(newAssessed);

        if (newAssessed.length === cards.length) {
            setTimeout(() => {
                setPopup({ show: true, message: "🎉 You've learned all the cards! Well done!", type: "complete" });
                updateProgress();
            }, 2000);

            setTimeout(() => {
                setPopup({ show: false, message: "", type: "" });
            }, 4000);
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
                    totalPoints: 20, // Fixed points for completing all cards
                    gameId: "constitutionCards"
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
                <div className="header10">
                    <button onClick={() => window.history.back()} className="back-btn10">←</button>
                    <div>
                        <h1>📚 {t.cards.title}</h1>
                        <p>{t.cards.desc}</p>
                    </div>
                </div>
                <div className="container10">
                    {/* Header */}


                    {/* Progress */}
                    <div className="progress-header10">
                        <span>
                            {language === 'hi' ? `कार्ड ${currentIndex + 1} / ${cards.length}` : `Card ${currentIndex + 1} of ${cards.length}`}
                        </span>
                        <div className="stats10">
                            <span className="pill10 knew10">✨ {knewCount} {t.cards.knew}</span>
                            <span className="pill10 learned10">💡 {learnedCount} {t.cards.learned}</span>
                        </div>              </div>


                    <div className="progress-bar10">
                        <div
                            className="progress-fill10"
                            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                        />
                    </div>

                    {/* Flashcard */}
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

                    {/* Actions */}
                    {flipped && (
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
