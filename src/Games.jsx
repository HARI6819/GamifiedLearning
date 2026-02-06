import React from "react";
import "./Games.css";
import { Gamepad2, Clock, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from './Footer'
import { useLanguage } from "./context/LanguageContext";

export default function Games() {
  const { t } = useLanguage();

  const games = [
    {
      title: t.home.gameFormats.games.wheel.title,
      desc: t.home.gameFormats.games.wheel.desc,
      time: t.home.gameFormats.games.wheel.time,
      level: t.home.gameFormats.games.wheel.level,
      icon: "🎡",
      color: "saffron",
      link: "/games/spin-wheel",
    },
    {
      title: t.home.gameFormats.games.cards.title,
      desc: t.home.gameFormats.games.cards.desc,
      time: t.home.gameFormats.games.cards.time,
      level: t.home.gameFormats.games.cards.level,
      icon: "🃏",
      color: "green",
      link: "/games/quiz-cards",
    },
    {
      title: t.home.gameFormats.games.climb.title,
      desc: t.home.gameFormats.games.climb.desc,
      time: t.home.gameFormats.games.climb.time,
      level: t.home.gameFormats.games.climb.level,
      icon: "🐍",
      color: "blue",
      link: "/games/snake-ladder",
    },
    {
      title: t.home.gameFormats.games.match.title,
      desc: t.home.gameFormats.games.match.desc,
      time: t.home.gameFormats.games.match.time,
      level: t.home.gameFormats.games.match.level,
      icon: "🎴",
      color: "gold",
      link: "/games/match-pairs",
    },
  ];

  return (
    <>
      <section>
        <Navbar />
      </section>
      <main className="gamehub1">
        <div className="container1">

          {/* Header */}
          <div className="header1">
            <span className="pill1">
              <Gamepad2 size={14} />
              {t.gamesPage.hub}
            </span>

            <h1>{t.gamesPage.title}</h1>
            <p>
              {t.gamesPage.subtitle}
            </p>
          </div>

          {/* Cards */}
          <div className="game-grid1">
            {games.map((game, index) => (
              <div className="game-card1" key={index}>
                <div className={`top-bar1 ${game.color}`} />

                <div className="card-body1">
                  <div className="card-header1">
                    <div className={`icon-box1 ${game.color}`}>
                      <span>{game.icon}</span>
                    </div>
                    <span className="level1">{game.level}</span>
                  </div>

                  <h3>{game.title}</h3>
                  <p className="desc1">{game.desc}</p>
                </div>

                <div className="card-footer1">
                  <span className="time1">
                    <Clock size={14} /> {game.time}
                  </span>

                  <Link to={game.link} className="play-btn1">
                    {t.home.gameFormats.playNow} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Box */}
          <div className="coming-soon1">
            <Star size={42} color={"#F59426"} />
            <h3>{t.gamesPage.comingSoon.title}</h3>
            <p>
              {t.gamesPage.comingSoon.desc}
            </p>
          </div>

        </div>
      </main>
      <section>
        <Footer />
      </section>
    </>
  );
}
