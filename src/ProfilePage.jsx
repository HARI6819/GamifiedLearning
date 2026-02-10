import React, { useState, useEffect, useRef } from "react";
import "./ProfilePage.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLanguage } from "./context/LanguageContext";
import { useNavigate } from "react-router";
import { User, Mail, Calendar, LogOut, Award, BookOpen, Gamepad2, CheckCircle } from "lucide-react";
import config from "./config";

const ProfilePage = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "Guest",
        email: "guest@example.com",
        profileImage: null,
        dob: "",
        gamesPlayed: 0,
        articlesRead: 0,
        totalPoints: 0
    });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: "",
        dob: "",
        profileImage: ""
    });
    const [updateLoading, setUpdateLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const editFormRef = useRef(null);

    useEffect(() => {
        if (isEditing && editFormRef.current) {
            editFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isEditing]);

    useEffect(() => {
        const fetchData = async () => {
            const email = localStorage.getItem('userEmail');
            const name = localStorage.getItem('userName');

            if (!email) {
                navigate('/');
                return;
            }

            try {
                const res = await fetch(`${config.API_URL}/api/progress/${email}`, {
                    headers: {
                        "ngrok-skip-browser-warning": "true"
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser({
                        name: name || data.name,
                        email: data.email,
                        profileImage: data.profileImage || null,
                        dob: data.dob || "",
                        gamesPlayed: data.gamesPlayed || 0,
                        articlesRead: data.articlesRead || 0,
                        totalPoints: data.totalPoints || 0
                    });
                    setEditData({
                        name: name || data.name,
                        dob: data.dob || "",
                        profileImage: data.profileImage || ""
                    });
                    if (data.profileImage) {
                        localStorage.setItem('profileImage', data.profileImage);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch profile data", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 400;
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

                    const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
                    setEditData({ ...editData, profileImage: compressedBase64 });
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const res = await fetch(`${config.API_URL}/api/user/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    email: user.email,
                    ...editData
                })
            });

            if (res.ok) {
                const data = await res.json();
                setUser({
                    ...user,
                    name: data.user.name,
                    dob: data.user.dob,
                    profileImage: data.user.profileImage
                });
                localStorage.setItem('userName', data.user.name);
                if (data.user.profileImage) {
                    localStorage.setItem('profileImage', data.user.profileImage);
                }
                setIsEditing(false);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }

    return (
        <>
            <section className="sectionProfile">
                <Navbar />
            </section>
            <main className="profile-wrapper">
                {localStorage.getItem('isGuest') === 'true' && (
                    <div className="guest-restriction-overlay animated fadeIn">
                        <div className="glossy-card-guest">
                            <span className="lock-icon-guest">🔒</span>
                            <h2>{t.login.guestRestrictedTitle || "Access Restricted"}</h2>
                            <p>{t.login.guestRestrictedMsg || "Please login to customize your profile and manage your journey."}</p>
                            <button className="login-redirect-btn" onClick={() => { localStorage.clear(); window.location.href = '/'; }}>
                                {t.login.login || "Login Now"}
                            </button>
                        </div>
                    </div>
                )}
                <div className="profile-container">
                    {/* Profile Header */}
                    <div className="profile-card profile-header-card">
                        <div className="profile-avatar">
                            {user.profileImage ? (
                                <img src={user.profileImage} alt="Profile" className="avatar-img" />
                            ) : (
                                <User size={60} />
                            )}
                        </div>
                        <div className="profile-info">
                            <h1>{user.name}</h1>
                            <p className="profile-email"><Mail size={16} /> {user.email}</p>
                            <span className="profile-badge">{t.progress.journey}</span>
                        </div>
                        <div className="profile-actions">
                            {!isEditing && (
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                                    <User size={18} /> {t.profile.edit || "Edit Profile"}
                                </button>
                            )}

                            <button className="logout-btn" onClick={handleLogout}>
                                <LogOut size={18} /> {t.profile.logout}
                            </button>
                        </div>
                    </div>

                    {/* Activity Grid */}
                    <div className="profile-grid">
                        <section className="profile-card stats-summary">
                            <h2 className="profile-section-title">{t.profile.statsTitle}</h2>
                            <div className="profile-stats-grid">
                                <div className="p-stat-box">
                                    <Gamepad2 size={24} className="icon-blue" />
                                    <div>
                                        <h3>{user.gamesPlayed}</h3>
                                        <span>{t.progress.gamesPlayed}</span>
                                    </div>
                                </div>
                                <div className="p-stat-box">
                                    <BookOpen size={24} className="icon-orange" />
                                    <div>
                                        <h3>{user.articlesRead}</h3>
                                        <span>{t.progress.articlesRead}</span>
                                    </div>
                                </div>
                                <div className="p-stat-box">
                                    <Award size={24} className="icon-green" />
                                    <div>
                                        <h3>{user.totalPoints}</h3>
                                        <span>{t.progress.totalPoints}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="profile-card profile-details" ref={editFormRef}>
                            <h2 className="profile-section-title">{t.profile.title}</h2>
                            {isEditing ? (
                                <form className="edit-form" onSubmit={handleUpdateProfile}>
                                    <div className="edit-image-section">
                                        <div className="edit-avatar">
                                            {editData.profileImage ? (
                                                <img src={editData.profileImage} alt="Preview" />
                                            ) : (
                                                <User size={40} />
                                            )}
                                        </div>
                                        <label htmlFor="edit-upload" className="upload-label">
                                            Change Photo
                                        </label>
                                        <input
                                            type="file"
                                            id="edit-upload"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t.profile.name}</label>
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            placeholder="Enter your name"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t.profile.dob || "Date of Birth"}</label>
                                        <input
                                            type="date"
                                            value={editData.dob}
                                            onChange={(e) => setEditData({ ...editData, dob: e.target.value })}
                                        />
                                    </div>
                                    <div className="edit-btns">
                                        <button type="submit" className="save-btn" disabled={updateLoading}>
                                            {updateLoading ? "Saving..." : (t.profile.save || "Save Changes")}
                                        </button>
                                        <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                                            {t.profile.cancel || "Cancel"}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="details-list">
                                    <div className="detail-item">
                                        <span className="label">{t.profile.name}</span>
                                        <span className="value">{user.name}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">{t.profile.email}</span>
                                        <span className="value">{user.email}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">{t.profile.dob || "Date of Birth"}</span>
                                        <span className="value">{user.dob || "Not set"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">{t.profile.joinDate}</span>
                                        <span className="value">February 2026</span>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
            <Footer />

            {/* Success Popup */}
            {showSuccess && (
                <div className="profile-success-popup">
                    <div className="success-content">
                        <div className="success-icon"><CheckCircle size={40} /></div>
                        <p>Profile Updated Successfully!</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfilePage;
