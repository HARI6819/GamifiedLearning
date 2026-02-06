import React, { useState } from "react";
import articles from "./data/articles.json";
import "./ChakraOfKnowledge.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLanguage } from "./context/LanguageContext";
import config from "./config";

const SEGMENTS = [
  "Executive",
  "Legislature",
  "Judiciary",
  "Executive",
  "Legislature",
  "Judiciary",
  "Executive",
  "Legislature",
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length;

export default function ChakraOfKnowledge() {
  const { t } = useLanguage();
  const [rotation, setRotation] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedArticle(null);

    const randomAngle = Math.floor(Math.random() * 360);
    const spins = 5 * 360;
    const finalRotation = rotation + spins + randomAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      const normalizedAngle = (360 - (finalRotation % 360)) % 360;
      const segmentIndex = Math.floor(normalizedAngle / SEGMENT_ANGLE);
      const category = SEGMENTS[segmentIndex];

      const categoryArticles = articles.filter(
        (a) => a.category === category
      );

      if (categoryArticles.length === 0) {
        setIsSpinning(false);
        return;
      }

      const randomArticle =
        categoryArticles[
        Math.floor(Math.random() * categoryArticles.length)
        ];

      setSelectedArticle(randomArticle);
      setIsSpinning(false);
      updateProgress(category);
    }, 2500);
  };

  const updateProgress = async (category) => {
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
          articlesRead: 1,
          totalPoints: 10,
          gameId: "chakra",
          mastery: { [category.toLowerCase()]: 5 } // Each article read gives 5% mastery for that category
        })
      });
    } catch (e) {
      console.error("Failed to update progress", e);
    }
  };

  function handleBack() {
    window.history.back();
  }

  // Helper to translate category
  const getTranslatedCategory = (cat) => {
    if (!cat) return "";
    const lower = cat.toLowerCase();
    return t.chakra.segments[lower] || cat;
  };

  return (
    <>
      <Navbar />

      <main className="chakra-page">
        {/* Header */}
        <div className="chakra-header">
          <button className="back-btn" onClick={handleBack}>←</button>
          <div>
            <h1>{t.chakra.title}</h1>
            <p>
              {t.chakra.desc}
            </p>
          </div>
        </div>

        <div className="chakra-content">
          {/* Wheel Section */}
          <div className="wheel-section">
            <div className="pointer"></div>

            <div
              className="spin-wheel-container"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <svg viewBox="0 0 100 100" className="spin-wheel-svg">
                {/* --- SEGMENTS --- */}
                {[
                  "#1e3a5f",
                  "#d97706",
                  "#166534",
                  "#1e4a6f",
                  "#e97706",
                  "#186534",
                  "#1e3a7f",
                  "#c97706",
                ].map((color, i) => {
                  const startAngle = i * 45;
                  const endAngle = startAngle + 45;
                  const largeArc = 0;

                  const polar = (angle) => {
                    const rad = (angle - 90) * (Math.PI / 180);
                    return {
                      x: 50 + 50 * Math.cos(rad),
                      y: 50 + 50 * Math.sin(rad),
                    };
                  };

                  const p1 = polar(startAngle);
                  const p2 = polar(endAngle);

                  const icons = ["🏛️", "📜", "⚖️"];

                  return (
                    <g key={i}>
                      <path
                        d={`M 50 50 L ${p1.x} ${p1.y} A 50 50 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`}
                        fill={color}
                        stroke="#fff"
                        strokeWidth="0.5"
                      />
                      <text
                        x={50 + 30 * Math.cos(((startAngle + 22.5) - 90) * Math.PI / 180)}
                        y={50 + 30 * Math.sin(((startAngle + 22.5) - 90) * Math.PI / 180)}
                        className="wheel-text"
                      >
                        {icons[i % 3]}
                      </text>
                    </g>
                  );
                })}

                {/* Center */}
                <circle cx="50" cy="50" r="12" className="center-circle-outer" />
                <circle cx="50" cy="50" r="10" className="center-circle-inner" />
                <text x="50" y="50" className="center-icon">⚖️</text>
              </svg>
            </div>

            <button
              className="spin-btn"
              onClick={spinWheel}
              disabled={isSpinning}
            >
              {t.chakra.spinBtn}
            </button>
          </div>

          {/* Info Section */}
          <div className="info-section">
            {!selectedArticle ? (
              <div className="info-card center">
                <div className="big-icon">🎡</div>
                <h3 className="h3info">{t.chakra.infoTitle}</h3>
                <p>
                  {t.chakra.infoDesc}
                </p>
              </div>
            ) : (
              <div className="info-card">
                <div className="badge-row">
                  <span className={`badge primary ${selectedArticle.category}`}>
                    {getTranslatedCategory(selectedArticle.category)}
                  </span>
                  <span className="badge">
                    {selectedArticle.organ}
                  </span>
                </div>

                <h2>{t.chakra.articlePrefix} {selectedArticle.number}</h2>
                <h3 className="article-title">
                  {selectedArticle.title}
                </h3>

                <div className="desc-box">
                  {selectedArticle.simplifiedText}
                </div>

                <div className="fact-box">
                  <strong>{t.chakra.funFact}</strong>
                  <p >{selectedArticle.funFact}</p>
                </div>

                <div className="badge-row bottom">
                  <span className="badge">
                    Part {selectedArticle.originalPart}
                  </span>
                  <span className="badge">
                    {selectedArticle.difficulty}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
