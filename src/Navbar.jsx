import './Navbar.css'
import { useState, useEffect, useRef } from "react";
import { Home, Gamepad2, BookOpen, Trophy, Menu, Languages, User, Sun, Moon, MessageCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom'
import { useLanguage } from './context/LanguageContext';
import { useTheme } from './context/ThemeContext';
import Chat from "./Chat";

function Navbar() {
    const [popUp, setPopUp] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const { t, language, toggleLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const profileImage = localStorage.getItem('profileImage');

    const navigate = useNavigate();

    function handleNavigateH() {
        navigate('/home');
    }
    function handleNavigateLe() {
        navigate('/Learn');
    }

    function handleNavigateGames() {
        navigate('/games');
    }

    function handleNavigateP() {
        navigate('/progress')
    }

    function handleNavigateProfile() {
        navigate('/profile')
    }


    function handleChatPopUp() {
        const data = !popUp;
        setPopUp(data);
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleMenuClick = (navigateFunc) => {
        navigateFunc();
        setIsMenuOpen(false);
    };


    return (
        <>
            <div className="chatBotLable" onClick={handleChatPopUp}>
                <span className="chat-tooltip">Ask me anything</span>
                <MessageCircle size={35} />
            </div>

            {popUp && <section className="chatBotIcon">
                <Chat />
            </section>}
            <div className={`nav${scrolled ? ' scrolled' : ''}`} ref={navRef}>
                <div className="logo" onClick={handleNavigateH}>
                    <div className="Logoicon">
                        <span>⚖️</span>
                    </div>
                    <div className='LName'>
                        <h1 className='Logoname'>{t.navbar.title}</h1>
                        <p>{t.navbar.subtitle}</p>
                    </div>
                </div>
                <div className="navigation">
                    <div className="mobile-wrapper">
                        <div className="theme-toggle-standalone" onClick={toggleTheme}>
                            {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
                        </div>
                        <div className="MobileView" onClick={toggleMenu}>
                            {isMenuOpen ? "✕" : "☰"}
                        </div>

                        {/* Mobile Menu Overlay */}
                        {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}

                        <ul className={isMenuOpen ? "show" : ""}>
                            <li onClick={() => handleMenuClick(handleNavigateH)}><Home size={20} />{t.navbar.home}</li>
                            <li onClick={() => handleMenuClick(handleNavigateGames)}><Gamepad2 size={20} />{t.navbar.games}</li>
                            <li onClick={() => handleMenuClick(handleNavigateLe)}><BookOpen size={20} />{t.navbar.learn}</li>
                            <li onClick={() => handleMenuClick(handleNavigateP)}><Trophy size={20} />{t.navbar.progress}</li>
                            <li onClick={() => handleMenuClick(handleNavigateProfile)}>
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="nav-profile-img" />
                                ) : (
                                    <User size={20} />
                                )}
                                {t.navbar.profile}
                            </li>
                            <li onClick={() => { toggleLanguage(); setIsMenuOpen(false); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <Languages size={20} />
                                {language === 'en' ? 'HI' : 'EN'}
                            </li>
                            <li className="desktop-theme-toggle" onClick={toggleTheme} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Navbar