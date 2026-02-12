
import { useState } from 'react';
import './Login.css'
import { useNavigate } from 'react-router';
import { useLanguage } from './context/LanguageContext';
import config from "./config";
import { User, Mail, Lock, LogIn, UserPlus, UserCircle, ArrowLeft } from 'lucide-react';

function Login() {
    const { t } = useLanguage();
    const [isSignup, setIsSignup] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [para, setPara] = useState(t.login.guestPara);
    // Guest
    const [Username, setUsername] = useState("");
    // Signup
    const [Name, setName] = useState("");
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    // Login
    const [LEmail, setLEmail] = useState("");
    const [LPassword, setLPassword] = useState("");
    //invalid popup
    const [popup, setPopup] = useState(false);
    // AlreadyExistPopup
    const [Apopup, setAlreadyExistPopup] = useState(false);
    // Loading state
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    function showSignup() {
        setIsSignup(true);
        setIsGuest(false);
        setPara(t.login.signinPara)
    }
    function showGuest() {
        setIsGuest(true);
        setIsSignup(false);
        setPara('Unlock features by playing as a guest')
    }
    function showLogin() {
        setIsSignup(false);
        setIsGuest(false);
        setPara(t.login.guestPara)
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 400; // Resize for optimization
                    const MAX_HEIGHT = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to ~50kb
                    const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
                    setProfileImage(compressedBase64);
                    setImagePreview(compressedBase64);
                };
            };
            reader.readAsDataURL(file);
        }
    };

    async function handleGuest(e) {
        if (!Username) return;
        setIsLoading(true);

        // Bypass backend API for guest login to ensure data privacy
        try {
            // Simulate a short network delay for better UX
            await new Promise(resolve => setTimeout(resolve, 800));

            localStorage.setItem('userEmail', Username);
            localStorage.setItem('userName', Username);
            localStorage.setItem('isGuest', 'true');
            // Reset image if any from previous session
            localStorage.removeItem('profileImage');

            navigate('/home', { state: { name: Username, flag: true } });
        } catch (e) {
            console.log("Error during guest login", e);
            setIsLoading(false);
        }
    }

    async function handleSignup(e) {
        if (!Name || !Email || !Password) return;
        setAlreadyExistPopup(false);
        setIsLoading(true);

        // Default avatar if none uploaded
        const finalProfileImage = profileImage || "https://ui-avatars.com/api/?name=" + encodeURIComponent(Name) + "&background=1e3a8a&color=fff";

        try {
            const res = await fetch(`${config.API_URL}/signup`, {
                method: 'POST',
                headers: {
                    "content-type": "application/json",
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify({ name: Name, email: Email, password: Password, profileImage: finalProfileImage }),
            });
            const data = await res.json();

            if (res.ok) {
                setAlreadyExistPopup(false);
                localStorage.setItem('userEmail', Email);
                localStorage.setItem('userName', Name);
                localStorage.setItem('profileImage', finalProfileImage);
                localStorage.setItem('isGuest', 'false');
                navigate('/home', { state: { name: Name, email: Email, extra: data, flag: true } });
            } else if (data.Error && data.Error.includes("duplicate key")) {
                console.log(data.Error);

                setAlreadyExistPopup(true);
                setIsLoading(false);
            } else {
                setAlreadyExistPopup(false);
                setIsLoading(false);
            }
        } catch (e) {
            console.log("Error", e);
            setAlreadyExistPopup(false);
            setIsLoading(false);
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        if (!LEmail || !LPassword) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${config.API_URL}/login`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify({ email: LEmail, password: LPassword })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('userEmail', LEmail);
                localStorage.setItem('userName', data.name);
                if (data.profileImage) {
                    localStorage.setItem('profileImage', data.profileImage);
                }
                localStorage.setItem('isGuest', 'false');
                navigate('/home', { state: { email: LEmail, extra: data, flag: true } });
            } else {
                setPopup(true);
                setIsLoading(false);
            }
        } catch (e) {
            console.log(e);
            setIsLoading(false);
        }
    }

    return (
        <div className='MainContainer'>
            {isLoading && (
                <div className="loader-overlay">
                    <div className="spinner"></div>
                    <p className="login-status-text">Logging in...</p>
                </div>
            )}
            <div className='container'>
                <div className='firstBox'>
                    <h1>Constitution Explorer</h1>
                    <p>{para}</p>
                </div>
                <div className="secondBox">
                    <div className={`formSlider ${isSignup ? "signup-active" : ""} ${isGuest ? "guest-active" : ""}`}>

                        {/* GUEST FORM */}
                        <div className='guestForm'>
                            <h1>{t.login.guestLogin}</h1>
                            <div className="input-group">
                                <User size={20} />
                                <input type="text" placeholder={t.login.namePlaceholder} onChange={(e) => setUsername(e.target.value)} value={Username} />
                            </div>
                            <button className="btn" onClick={handleGuest}>
                                {t.login.login}
                            </button>
                            <p>
                                <span onClick={() => showLogin()} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <ArrowLeft size={16} /> {t.login.back}
                                </span>
                            </p>
                        </div>

                        {/* LOGIN FORM */}
                        
                        <div className="Loginform">
                            <h1>{t.login.login}</h1>
                            <form onSubmit={handleLogin} className='form-details'>
                            <div className="input-group">
                                <Mail size={20} />
                                <input type="email" placeholder={t.login.emailPlaceholder} value={LEmail} onChange={(e) => setLEmail(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <Lock size={20} />
                                <input type="password" placeholder={t.login.passwordPlaceholder} value={LPassword} onChange={(e) => setLPassword(e.target.value)} />
                            </div>
                            {popup && <p style={{ color: "#ef4444", fontSize: "14px", marginTop: '-10px', marginBottom: '10px' }}>{t.login.invalid}</p>}
                            <button type='submit' className="btn" onClick={handleLogin}>
                                {t.login.loginBtn}
                            </button>
                            </form>

                            <p>
                                {t.login.noAccount}
                                <span onClick={() => showSignup()}> {t.login.signup}</span>
                            </p>

                            <div className='hr-text'>
                                <hr />
                                <span>or</span>
                                <hr />
                            </div>

                            <button className="btn btn-guest" onClick={() => showGuest()}>
                                <UserCircle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                {t.login.guestBtn}
                            </button>
                        </div>

                        {/* SIGNUP FORM */}
                        <div className="signupform">
                            <h1>{t.login.signup}</h1>

                            <div className="profile-upload-container">
                                <label htmlFor="profile-upload" className="profile-upload-label">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="profile-preview" />
                                    ) : (
                                        <div className="profile-placeholder">
                                            <User size={40} />
                                            <span>Add Photo</span>
                                        </div>
                                    )}
                                </label>
                                <input
                                    id="profile-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            <div className="input-group">
                                <User size={20} />
                                <input type="text" placeholder={t.login.namePlaceholder} value={Name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <Mail size={20} />
                                <input type="email" placeholder={t.login.emailPlaceholder} value={Email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <Lock size={20} />
                                <input type="password" placeholder={t.login.passwordPlaceholder} value={Password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            {Apopup && <p style={{ color: "#ef4444", fontSize: "14px", marginTop: '-10px', marginBottom: '10px' }}>{t.login.exists}</p>}
                            <button className="btn" onClick={handleSignup}>
                                {t.login.createAccount}
                            </button>
                            <p>
                                {t.login.alreadyHave}
                                <span onClick={() => showLogin()}> {t.login.login}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
