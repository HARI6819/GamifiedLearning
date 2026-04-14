import { useState } from 'react';
import './Login.css'
import { useNavigate } from 'react-router';
import { Lock, LogIn, ArrowLeft, User } from 'lucide-react';

function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [popup, setPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    async function handleAdminLogin(e) {
        e.preventDefault();
        if (!username || !password) return;
        setIsLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Hardcoded admin credentials
        if (username === "admin" && password === "admin123") {
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('userEmail', 'admin@constitutionexplorer.com');
            localStorage.setItem('userName', 'Admin');
            navigate('/dashboard');
        } else {
            setPopup(true);
        }
        setIsLoading(false);
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
                    <h1>Admin Panel</h1>
                    <p>Access the administration dashboard</p>
                </div>
                
                    <div className="Loginform1"> 
                        <h1>Admin Login</h1>
                        <form onSubmit={handleAdminLogin} className='form-details'>
                            <div className="input-group">
                                <User size={20} />
                                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <Lock size={20} />
                                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            {popup && <p style={{ color: "#ef4444", fontSize: "14px", marginTop: '-10px', marginBottom: '10px' }}>Invalid credentials</p>}
                            <button type='submit' className="btn" onClick={handleAdminLogin}>
                                <LogIn size={20} style={{ marginRight: '8px' }} />
                                Login as Admin
                            </button>
                        </form>
                        <p>
                            <span onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                <ArrowLeft size={16} /> Back to User Login
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        
    );
}

export default AdminLogin;