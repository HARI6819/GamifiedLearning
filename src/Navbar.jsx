import './Navbar.css'
import { useState, useEffect, useRef } from "react";
import { Home, Gamepad2, BookOpen, Trophy, Menu, Languages, User, Sun, Moon, MessageCircle } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from './context/LanguageContext';
import { useTheme } from './context/ThemeContext';
import TranslatedText from './TranslatedText';
import Chat from './Chat';

function Navbar() {
    const [popUp, setPopUp] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeNav, setActiveNav] = useState('home');
    const navRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Determine active nav based on current route
    useEffect(() => {
        const pathname = location.pathname.toLowerCase();
        if (pathname.includes('/games')) {
            setActiveNav('games');
        } else if (pathname.includes('/learn')) {
            setActiveNav('learn');
        } else if (pathname.includes('/progress')) {
            setActiveNav('progress');
        } else if (pathname.includes('/profile')) {
            setActiveNav('profile');
        } else {
            setActiveNav('home');
        }
    }, [location.pathname]);
    const { t, language, changeLanguage } = useLanguage();
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
                <span className="chat-tooltip"><TranslatedText>Ask me anything</TranslatedText></span>
                <MessageCircle size={35} />
            </div>

            {popUp && <section className="chatBotIcon">
                <Chat onResponse={handleChatPopUp} />
            </section>}
            <div className={`nav${scrolled ? ' scrolled' : ''}`} ref={navRef}>
                <div className="logo" onClick={handleNavigateH}>
                    <div className="Logoicon">
                        <span>⚖️</span>
                    </div>
                    <div className='LName'>
                        <h1 className='Logoname'><TranslatedText>{t.navbar.title}</TranslatedText></h1>
                        <p><TranslatedText>{t.navbar.subtitle}</TranslatedText></p>
                    </div>
                </div>
                <div className="navigation">
                    <div className="mobile-wrapper">
                        <div className="theme-toggle-standalone" onClick={toggleTheme}>
                            {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
                        </div>
                        <div className="language-toggle-standalone">
                            {<select
                                value={language}
                                onChange={(e) => changeLanguage(e.target.value)}
                                style={{}}
                            >
                                <option value="en">English</option>
                                <option value="hi">हिंदी</option>
                                <option value="ta">தமிழ்</option>
                                <option value="te">తెలుగు</option>
                                <option value="bn">বাংলা</option>
                                <option value="mr">मराठी</option>
                                <option value="gu">ગુજરાતી</option>
                                <option value="kn">ಕನ್ನಡ</option>
                                <option value="ml">മലയാളം</option>
                                <option value="pa">ਪੰਜਾਬੀ</option>
                            </select>}
                        </div>

                        <ul className="">
                            <li onClick={handleNavigateH} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Home size={20} />
                                <TranslatedText>{t.navbar.home}</TranslatedText>
                            </li>
                            <li onClick={handleNavigateGames} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Gamepad2 size={20} />
                                <TranslatedText>{language === 'ta' ? 'விளையாட்டுகள்' : t.navbar.games}</TranslatedText>
                            </li>
                            <li onClick={handleNavigateLe} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BookOpen size={20} />
                                <TranslatedText>{language === 'ta' ? 'கற்றுக்கொள்' : t.navbar.learn}</TranslatedText>
                            </li>
                            <li onClick={handleNavigateP} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Trophy size={20} />
                                <TranslatedText>{t.navbar.progress}</TranslatedText>
                            </li>
                            <li onClick={handleNavigateProfile} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="nav-profile-img" />
                                ) : (
                                    <User size={20} />
                                )}
                                <TranslatedText>{t.navbar.profile}</TranslatedText>
                            </li>
                            <li className="desktop-theme-toggle" onClick={toggleTheme} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                                <TranslatedText>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</TranslatedText>
                            </li>
                            <li className="desktop-language-select" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Languages size={20} />
                                <select
                                    value={language}
                                    onChange={(e) => changeLanguage(e.target.value)}
                                    style={{}}
                                >
                                    <option value="en">English</option>
                                    <option value="hi">हिंदी</option>
                                    <option value="ta">தமிழ்</option>
                                    <option value="te">తెలుగు</option>
                                    <option value="bn">বাংলা</option>
                                    <option value="mr">मराठी</option>
                                    <option value="gu">ગુજરાતી</option>
                                    <option value="kn">ಕನ್ನಡ</option>
                                    <option value="ml">മലയാളം</option>
                                    <option value="pa">ਪੰਜਾਬੀ</option>
                                </select>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Mobile Navigation Bar */}
            <div className="bottom-navbar">
                <div className={`bottom-nav-item ${activeNav === 'home' ? 'active' : ''}`} onClick={() => handleNavigateH()}>
                    <Home size={24} />
                    {/* <span>{t.navbar.home}</span> */}
                </div>
                <div className={`bottom-nav-item ${activeNav === 'games' ? 'active' : ''}`} onClick={() => handleNavigateGames()}>
                    <Gamepad2 size={24} />
                    {/* <span>{t.navbar.games}</span> */}
                </div>
                <div className={`bottom-nav-item ${activeNav === 'learn' ? 'active' : ''}`} onClick={() => handleNavigateLe()}>
                    <BookOpen size={24} />
                    {/* <span>{t.navbar.learn}</span> */}
                </div>
                <div className={`bottom-nav-item ${activeNav === 'progress' ? 'active' : ''}`} onClick={() => handleNavigateP()}>
                    <Trophy size={24} />
                    {/* <span>{t.navbar.progress}</span> */}
                </div>
                <div className={`bottom-nav-item ${activeNav === 'profile' ? 'active' : ''}`} onClick={() => handleNavigateProfile()}>
                    {profileImage ? (
                        <img src={profileImage} alt="Profile" className="bottom-nav-profile-img" />
                    ) : (
                        <User size={24} />
                    )}
                    {/* <span>{t.navbar.profile}</span> */}
                </div>
            </div>

        </>
    )
}

export default Navbar