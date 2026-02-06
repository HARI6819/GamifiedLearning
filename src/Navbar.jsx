import './Navbar.css'
import { useState } from "react";
import { Home, Gamepad2, BookOpen, Trophy, Menu, Languages, User } from "lucide-react";
import { useNavigate } from 'react-router-dom'
import { useLanguage } from './context/LanguageContext';
import Chat from "./Chat";

function Navbar() {
    const [popUp, setPopUp] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { t, language, toggleLanguage } = useLanguage();
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
            <div className="chatBotLable" onClick={handleChatPopUp}>{t.navbar.client}</div>

            {popUp && <section className="chatBotIcon">
                <Chat />
            </section>}
            <div className="nav">
                <div className="logo">
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
                        <div className="MobileView" onClick={toggleMenu}>
                            {isMenuOpen ? "✕" : "☰"}
                        </div>

                        <ul className={isMenuOpen ? "show" : ""}>
                            <li onClick={() => handleMenuClick(handleNavigateH)}><Home size={18} />{t.navbar.home}</li>
                            <li onClick={() => handleMenuClick(handleNavigateGames)}><Gamepad2 size={18} />{t.navbar.games}</li>
                            <li onClick={() => handleMenuClick(handleNavigateLe)}><BookOpen size={18} />{t.navbar.learn}</li>
                            <li onClick={() => handleMenuClick(handleNavigateP)}><Trophy size={18} />{t.navbar.progress}</li>
                            <li onClick={() => handleMenuClick(handleNavigateProfile)}>
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="nav-profile-img" />
                                ) : (
                                    <User size={18} />
                                )}
                                {t.navbar.profile}
                            </li>
                            <li onClick={() => { toggleLanguage(); setIsMenuOpen(false); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <Languages size={18} />
                                {language === 'en' ? 'HI' : 'EN'}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Navbar