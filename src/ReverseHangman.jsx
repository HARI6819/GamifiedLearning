import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Shield, Trophy, RotateCcw, Lock, LockOpen, Heart } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';
import './ReverseHangman.css';
import Navbar from './Navbar';
import Footer from './Footer';
import config from './config';

const MAX_WRONG_GUESSES = 6;
const TIME_LIMITS = { Easy: 120, Medium: 90, Hard: 60 };

export default function ReverseHangman() {
    const { t, language } = useLanguage();
    const location = useLocation();

    const [gameState, setGameState] = useState('start'); // start, playing, won, lost
    const [difficulty, setDifficulty] = useState('Easy');
    const [unlockedLevels, setUnlockedLevels] = useState(['Easy']);

    const [currentWord, setCurrentWord] = useState(null);
    const [guessedLetters, setGuessedLetters] = useState(new Set());
    const [wrongGuesses, setWrongGuesses] = useState(0);
    const [timer, setTimer] = useState(0);
    const [score, setScore] = useState(0);

    const translate = t.reverseHangman;

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
                    const completed = data.completedLevels || {};
                    const allGames = ["articleMatch", "rightsDutiesClimb", "constitutionCards", "chakra", "quiz", "sort", "crossroads", "justiceJury", "reverseHangman"];
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
        let interval;
        if (gameState === 'playing' && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        setGameState('lost');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState, timer]);

    const startGame = () => {
        const words = translate.words[difficulty];
        const randomWord = words[Math.floor(Math.random() * words.length)];
        setCurrentWord(randomWord);
        setGuessedLetters(new Set());
        setWrongGuesses(0);
        setTimer(TIME_LIMITS[difficulty]);
        setGameState('playing');
        setScore(0);
    };

    const handleGuess = useCallback((letter) => {
        if (gameState !== 'playing' || guessedLetters.has(letter)) return;

        const newGuessed = new Set(guessedLetters).add(letter);
        setGuessedLetters(newGuessed);

        const isCorrect = currentWord.word.toUpperCase().includes(letter);

        if (!isCorrect) {
            const newWrong = wrongGuesses + 1;
            setWrongGuesses(newWrong);
            if (newWrong >= MAX_WRONG_GUESSES) {
                setGameState('lost');
            }
        } else {
            // Check win
            let guessableLetters = [];
            if (language === 'hi') {
                const hindiMatras = /[\u0900-\u0903\u093E-\u094C\u094D]/;
                guessableLetters = currentWord.word.split('').filter(char => {
                    return !hindiMatras.test(char) && !/^[.,\-!?'"() ]+$/.test(char);
                });
            } else {
                guessableLetters = currentWord.word.toUpperCase().replace(/[^A-Z]/g, '').split('');
            }

            const hasWon = guessableLetters.length > 0 && guessableLetters.every(l => newGuessed.has(l));
            if (hasWon) {
                setGameState('won');
                const earnedScore = (TIME_LIMITS[difficulty] - timer) * 10 + (MAX_WRONG_GUESSES - wrongGuesses) * 50;
                setScore(prev => prev + earnedScore);
                updateProgress(earnedScore);
            }
        }
    }, [gameState, guessedLetters, currentWord, wrongGuesses, timer, difficulty]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toUpperCase();
            if (/^[A-Z]$/.test(key)) {
                handleGuess(key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleGuess]);

    const updateProgress = async (earnedScore) => {
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
                    totalPoints: earnedScore,
                    gameId: "reverseHangman",
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

    const maskWord = (word) => {
        if (language === 'hi') {
            const hindiMatras = /[\u0900-\u0903\u093E-\u094C\u094D]/;
            return word.split('').map(char => {
                if (char === ' ' || /^[.,\-!?'"()]+$/.test(char)) return char;
                if (hindiMatras.test(char)) return char; // Auto-reveal matras
                return guessedLetters.has(char) ? char : '_';
            }).join(''); // Do not join with spaces so matras stack properly
        } else {
            return word.split('').map(char => {
                if (char === ' ' || /^[.,\-!?'"()]+$/.test(char)) return char;
                return guessedLetters.has(char.toUpperCase()) ? char : '_';
            }).join(' ');
        }
    };

    const englishAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const hindiAlphabet = [
        "अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ",
        "क", "ख", "ग", "घ", "च", "छ", "ज", "झ", "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न",
        "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह", "क्ष", "त्र", "ज्ञ"
    ];

    const alphabet = language === 'hi' ? hindiAlphabet : englishAlphabet;

    const renderHangman = () => {
        const parts = [
            <circle key="head" cx="150" cy="80" r="20" stroke="currentColor" strokeWidth="4" fill="none" />,
            <line key="body" x1="150" y1="100" x2="150" y2="170" stroke="currentColor" strokeWidth="4" />,
            <line key="armL" x1="150" y1="120" x2="110" y2="160" stroke="currentColor" strokeWidth="4" />,
            <line key="armR" x1="150" y1="120" x2="190" y2="160" stroke="currentColor" strokeWidth="4" />,
            <line key="legL" x1="150" y1="170" x2="120" y2="230" stroke="currentColor" strokeWidth="4" />,
            <line key="legR" x1="150" y1="170" x2="180" y2="230" stroke="currentColor" strokeWidth="4" />
        ];

        return (
            <svg width="200" height="250" viewBox="0 0 300 300" className="rh-hangman-svg text-quest-primary">
                {/* Base and pole */}
                <line x1="50" y1="280" x2="250" y2="280" stroke="currentColor" strokeWidth="8" />
                <line x1="100" y1="280" x2="100" y2="20" stroke="currentColor" strokeWidth="8" />
                <line x1="96" y1="20" x2="200" y2="20" stroke="currentColor" strokeWidth="8" />
                <line x1="150" y1="20" x2="150" y2="60" stroke="currentColor" strokeWidth="4" />

                {/* Hangman parts based on wrong guesses */}
                {parts.slice(0, wrongGuesses)}
            </svg>
        );
    };

    return (
        <>
            <section className='section1'>
                <Navbar />
            </section>
            <div className="rh-page-container flex flex-col min-h-screen">



                <main className="rh-main-content">
                    <header className="rh-header">
                        <button onClick={() => window.history.back()} className="rh-back-btn">←</button>
                        <div>
                            <h1 className="rh-title">
                                🛡️ {translate.title}
                            </h1>
                            <p className="rh-desc">{translate.desc}</p>
                        </div>
                    </header>

                    {gameState === 'start' && (
                        <div className="start-screen-rh">
                            <div className="icon-wrapper-rh"><Shield size={40} /></div>
                            <h2>{translate.title}</h2>
                            <p>{translate.desc}</p>

                            <h4 style={{ fontFamily: "'Times New Roman', serif", fontWeight: 700, marginTop: '1rem' }}>{translate.difficulty}</h4>
                            <div className="diff-grid-rh">
                                {['Easy', 'Medium', 'Hard'].map((level) => {
                                    const isUnlocked = unlockedLevels.includes(level);
                                    return (
                                        <button
                                            key={level}
                                            onClick={() => isUnlocked && setDifficulty(level)}
                                            className={`diff-btn-rh ${difficulty === level ? 'active' : ''}`}
                                            disabled={!isUnlocked}
                                        >
                                            {!isUnlocked ? <Lock size={14} /> : (difficulty !== level && <LockOpen size={14} style={{ opacity: 0.7 }} />)}
                                            {t.common.difficulty[level]}
                                        </button>
                                    );
                                })}
                            </div>
                            <button className="start-btn-rh" onClick={startGame}>
                                {translate.startGame}
                            </button>
                        </div>
                    )}

                    {gameState !== 'start' && currentWord && (
                        <div className="rh-game-container">
                            {/* HUD */}
                            <div className="rh-hud bg-quest-card">
                                <div className="rh-hud-timer text-quest-muted">
                                    <Timer size={20} className={timer <= 10 ? 'rh-timer-danger' : ''} />
                                    <span className={timer <= 10 ? 'rh-timer-danger-text' : ''}>{formatTime(timer)}</span>
                                </div>
                                <div className="rh-hud-lives text-quest-primary">
                                    <Heart size={20} className={wrongGuesses >= MAX_WRONG_GUESSES - 1 ? 'rh-lives-danger' : ''} />
                                    <span>Lives: {MAX_WRONG_GUESSES - wrongGuesses}</span>
                                </div>
                            </div>

                            {/* Game Area */}
                            <div className="rh-arena">
                                {/* Visual Scene */}
                                <div className="rh-visual-scene bg-quest-card">
                                    {renderHangman()}

                                    {gameState === 'lost' && (
                                        <div className="rh-overlay rh-overlay-lost">
                                            <div className="rh-overlay-content">
                                                <h3 className="rh-overlay-title-lost">{translate.failed}</h3>
                                                <p className="rh-overlay-text text-quest-text">The word was: <span className="rh-overlay-word text-quest-primary">{currentWord.word}</span></p>
                                            </div>
                                        </div>
                                    )}

                                    {gameState === 'won' && (
                                        <div className="rh-overlay rh-overlay-won">
                                            <div className="rh-overlay-content">
                                                <Trophy size={64} className="rh-overlay-icon-won" />
                                                <h3 className="rh-overlay-title-won">{translate.saved}</h3>
                                                <p className="rh-overlay-score text-quest-text">+ {score} pts</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* UI */}
                                <div className="rh-game-ui bg-quest-card">

                                    {/* Hint */}
                                    <div className="rh-hint-container">
                                        <span className="rh-category-badge text-quest-primary">
                                            {currentWord.category}
                                        </span>
                                        <p className="rh-hint-text text-quest-text">{currentWord.hint}</p>
                                    </div>

                                    {/* Word Display */}
                                    <div className="rh-word-display">
                                        <h2 className="rh-word-text text-quest-primary">
                                            {maskWord(currentWord.word)}
                                        </h2>
                                    </div>

                                    {/* Keyboard */}
                                    {gameState === 'playing' ? (
                                        <div className="rh-keyboard">
                                            {alphabet.map(letter => {
                                                const isGuessed = guessedLetters.has(letter);
                                                const isCorrect = isGuessed && currentWord.word.toUpperCase().includes(letter);
                                                const isWrong = isGuessed && !isCorrect;

                                                let btnClass = "rh-key-btn ";

                                                if (isCorrect) {
                                                    btnClass += "rh-key-correct ";
                                                } else if (isWrong) {
                                                    btnClass += "rh-key-wrong ";
                                                } else {
                                                    btnClass += "rh-key-unpressed text-quest-text hover:text-quest-primary";
                                                }

                                                return (
                                                    <button
                                                        key={letter}
                                                        onClick={() => handleGuess(letter)}
                                                        disabled={isGuessed || gameState !== 'playing'}
                                                        className={btnClass}
                                                    >
                                                        {letter}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="rh-play-again-wrapper">
                                            <button
                                                onClick={startGame}
                                                className="btn-primary rh-play-again-btn"
                                            >
                                                <RotateCcw size={20} />
                                                {translate.playAgain}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                <Footer />
            </div>
        </>
    );
}
