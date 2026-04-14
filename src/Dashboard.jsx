import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";
import "./Dashboard.css";
import { Home, Database, LayoutDashboard, LogOut, FileText, CheckCircle2, Users, Edit, Trash2, Award, XSquare, Eye } from "lucide-react";
import config from "./config";

// --- Game Data Imports (Base static data) ---
import chakraQuestions from "./data/chakraQuestions.json";
import cardsQuestions from "./data/cards.json";
import quizData from "./data/quizData.json";
import climbData from "./data/arti.json";
import articleMatch from "./data/articleMatchQuestions.json";
import sortData from "./data/sortQuestions.json";
import crossroadsData from "./data/crossroadsQuestions.json";
import justiceJuryData from "./data/justiceJuryQuestions.json";
import hangmanData from "./data/hangmanQuestions.json";

const gamesList = [
    { id: "chakra", name: "Chakra of Knowledge", isFlat: true },
    { id: "cards", name: "Constitution Cards", isFlat: true },
    { id: "quiz", name: "Quiz Mode", isFlat: false },
    { id: "climb", name: "Rights Duties Climb", isFlat: true },
    { id: "articleMatch", name: "Article Match", isFlat: true },
    { id: "sort", name: "Constitutional Sort", isFlat: false },
    { id: "crossroads", name: "Crossroads", isFlat: false },
    { id: "justiceJury", name: "Justice Jury", isFlat: false },
    { id: "hangman", name: "Reverse Hangman", isFlat: false }
];

const categoryOptions = [
    { label: 'Judiciary', value: 'Judiciary' },
    { label: 'Executive', value: 'Executive' },
    { label: 'Legislature', value: 'Legislature' }
];

const optionIndexes = [
    { label: 'Option 1', value: 0 },
    { label: 'Option 2', value: 1 },
    { label: 'Option 3', value: 2 },
    { label: 'Option 4', value: 3 }
];

const schemas = {
    chakra: [
        { key: 'question', label: 'Question Text', type: 'textarea' },
        { key: 'options', label: 'Options (comma separated)', type: 'text', isArray: true },
        { key: 'correctIndex', label: 'Correct Option', type: 'select', options: optionIndexes },
        { key: 'category', label: 'Category', type: 'select', options: categoryOptions }
    ],
    cards: [
        { key: 'question', label: 'Question Text', type: 'textarea' },
        { key: 'answer', label: 'Answer Text', type: 'textarea' },
        { key: 'category', label: 'Category', type: 'select', options: categoryOptions }
    ],
    quiz: [
        { key: 'question', label: 'Question Text', type: 'textarea' },
        { key: 'options', label: 'Options (comma separated)', type: 'text', isArray: true },
        { key: 'correctIndex', label: 'Correct Option', type: 'select', options: optionIndexes },
        { key: 'category', label: 'Category', type: 'select', options: categoryOptions }
    ],
    climb: [
        { key: 'question', label: 'Question Text', type: 'textarea' },
        { key: 'options', label: 'Options (comma separated)', type: 'text', isArray: true },
        { key: 'correctIndex', label: 'Correct Option', type: 'select', options: optionIndexes },
        { key: 'points', label: 'Points', type: 'number' },
        { key: 'category', label: 'Category', type: 'select', options: categoryOptions }
    ],
    articleMatch: [
        { key: 'article', label: 'Article Text', type: 'textarea' },
        { key: 'mean', label: 'Meaning / Match Text', type: 'textarea' },
        { key: 'difficulty', label: 'Difficulty', type: 'select', options: [{ label: 'Easy', value: 'Easy' }, { label: 'Medium', value: 'Medium' }, { label: 'Hard', value: 'Hard' }] },
        { key: 'category', label: 'Category', type: 'select', options: categoryOptions }
    ],
    sort: [
        { key: 'text', label: 'Item Text', type: 'textarea' },
        { key: 'category', label: 'Category', type: 'select', options: categoryOptions }
    ],
    crossroads: [
        { key: 'title', label: 'Scenario Title', type: 'text' },
        { key: 'situation', label: 'Situation Details', type: 'textarea' },
        { key: 'choices', label: 'Choices (comma separated)', type: 'textarea', isArray: true },
        { key: 'correctChoice', label: 'Correct Choice', type: 'select', options: [{ label: 'Choice A', value: 'a' }, { label: 'Choice B', value: 'b' }, { label: 'Choice C', value: 'c' }] },
        { key: 'explanation', label: 'Explanation', type: 'textarea' },
        { key: 'articles', label: 'Related Articles (comma separated)', type: 'text', isArray: true },
        { key: 'category', label: 'Category', type: 'select', options: categoryOptions }
    ],
    justiceJury: [
        { key: 'title', label: 'Case Title', type: 'text' },
        { key: 'context', label: 'Case Context', type: 'textarea' },
        { key: 'charges', label: 'Charges', type: 'text' },
        { key: 'lawyer1Argument', label: 'Lawyer 1 Argument', type: 'textarea' },
        { key: 'lawyer2Argument', label: 'Lawyer 2 Argument', type: 'textarea' },
        { key: 'category', label: 'Category', type: 'select', options: categoryOptions }
    ],
    hangman: [
        { key: 'word', label: 'Word to Guess', type: 'text' },
        { key: 'hint', label: 'Hint provided to user', type: 'textarea' },
        { key: 'category', label: 'Category', type: 'select', options: categoryOptions }
    ]
};

export default function Dashboard() {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState("overview");

    // --- Statistics and User Data ---
    const [usersList, setUsersList] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);

    // Edit User state
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({});

    // View User state
    const [viewingUser, setViewingUser] = useState(null);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                // Leaderboard
                const lbRes = await fetch(`${config.API_URL}/api/leaderboard?type=overall`, { headers: { "ngrok-skip-browser-warning": "true" } });
                if (lbRes.ok) setLeaderboard(await lbRes.json());

                // Users
                const uRes = await fetch(`${config.API_URL}/api/admin/users`, { headers: { "ngrok-skip-browser-warning": "true" } });
                if (uRes.ok) setUsersList(await uRes.json());
            } catch (e) {
                console.error("Admin data fetch failed", e);
            }
        };
        fetchAdminData();
    }, [activeTab]);

    // --- Question Management State ---
    const [selectedGame, setSelectedGame] = useState("chakra");
    const [inputDifficulty, setInputDifficulty] = useState("Easy");
    const [formData, setFormData] = useState({});
    const [statusMsg, setStatusMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState(null);

    // Dynamic Questions from MongoDB
    const [fetchedDynamicQuestions, setFetchedDynamicQuestions] = useState([]);

    useEffect(() => {
        const fetchRemote = async () => {
            if (activeTab !== "questions") return;
            try {
                const res = await fetch(`${config.API_URL}/api/questions?gameKey=${selectedGame}`, { headers: { "ngrok-skip-browser-warning": "true" } });
                if (res.ok) {
                    const data = await res.json();
                    setFetchedDynamicQuestions(data);
                }
            } catch (e) {
                console.error("Failed to fetch remote dynamic questions", e);
            }
        };
        fetchRemote();
    }, [selectedGame, activeTab]);

    // Initialize/Reset form based on schema
    useEffect(() => {
        const initial = {};
        (schemas[selectedGame] || []).forEach(field => {
            if (field.type === 'select' && field.options && field.options.length > 0) {
                initial[field.key] = field.options[0].value;
            } else {
                initial[field.key] = field.type === 'number' ? 0 : "";
            }
        });
        setFormData(initial);
        setStatusMsg("");
    }, [selectedGame]);

    const handleFormChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // Calculate sum of active questions loaded
    const getTotalQuestionsCount = () => {
        // Base approximation of huge local jsons:
        return 792 + fetchedDynamicQuestions.length;
    }

    const getCurrentRecords = () => {
        let records = [];
        try {
            switch (selectedGame) {
                case "chakra": records = chakraQuestions; break;
                case "cards": records = cardsQuestions; break;
                case "quiz": records = quizData[inputDifficulty] || []; break;
                case "climb": records = climbData; break;
                case "articleMatch": records = articleMatch; break;
                case "sort": records = sortData[inputDifficulty] || []; break;
                case "crossroads": records = crossroadsData[inputDifficulty] || []; break;
                case "justiceJury": records = justiceJuryData[inputDifficulty] || []; break;
                case "hangman": records = hangmanData.words?.[inputDifficulty] || []; break;
            }
            if (!Array.isArray(records)) return [];
            const isFlat = gamesList.find(g => g.id === selectedGame)?.isFlat;
            const dynamicForDifficulty = fetchedDynamicQuestions.filter(q => (q.difficulty || q.questionData.difficulty) === inputDifficulty || isFlat);
            const merged = [...records, ...dynamicForDifficulty.map(q => ({ ...q.questionData, _mongoId: q._id }))];
            return merged.slice().reverse();
        } catch (e) {
            console.error("Error formatting records", e);
        }
        return [];
    };

    const handleEditQuestionClick = (rec) => {
        setEditingQuestionId(rec._mongoId);
        let initial = {};
        const currentSchema = schemas[selectedGame];
        currentSchema.forEach(field => {
            initial[field.key] = rec[field.key];
        });
        setFormData(initial);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddQuestion = async () => {
        setStatusMsg("");

        const currentSchema = schemas[selectedGame];

        // Rigorous Field Validation
        for (const field of currentSchema) {
            let val = formData[field.key];
            if (val === undefined || val === null || String(val).trim() === "") {
                setStatusMsg(`❌ Error: Required field is empty -> ${field.label || field.key}`);
                return;
            }
        }

        setIsSubmitting(true);
        const isFlat = gamesList.find(g => g.id === selectedGame)?.isFlat;

        const finalData = { id: Date.now().toString() };
        if (!isFlat) finalData.difficulty = inputDifficulty;

        for (const field of currentSchema) {
            let val = formData[field.key];
            if (field.isArray && typeof val === 'string') {
                val = val.split(',').map(s => s.trim()).filter(s => s);
                if (selectedGame === 'crossroads' && field.key === 'choices') {
                    val = val.map((text, i) => ({ id: ['a', 'b', 'c', 'd'][i] || 'a', text }));
                }
            } else if (field.type === 'number' || (field.type === 'select' && typeof field.options?.[0]?.value === 'number')) {
                val = Number(val);
            }
            finalData[field.key] = val;
        }

        try {
            const url = editingQuestionId ? `${config.API_URL}/api/update-question/${editingQuestionId}` : `${config.API_URL}/api/add-question`;
            const method = editingQuestionId ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    gameKey: selectedGame,
                    questionData: finalData
                })
            });

            if (res.ok) {
                setStatusMsg(editingQuestionId ? "✅ Question securely updated!" : "✅ Question securely added to the MongoDB database!");
                setEditingQuestionId(null);

                const initial = {};
                currentSchema.forEach(field => {
                    if (field.type === 'select' && field.options && field.options.length > 0) {
                        initial[field.key] = field.options[0].value;
                    } else {
                        initial[field.key] = field.type === 'number' ? 0 : "";
                    }
                });
                setFormData(initial);

                const fetchRes = await fetch(`${config.API_URL}/api/questions?gameKey=${selectedGame}`);
                if (fetchRes.ok) {
                    const fresh = await fetchRes.json();
                    setFetchedDynamicQuestions(fresh);
                }
            } else {
                const err = await res.json();
                setStatusMsg(`❌ Server Error: ${err.error || "Failed"}`);
            }
        } catch (e) {
            setStatusMsg("❌ Network Error while reaching backend APIs.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (email) => {
        if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
        try {
            const res = await fetch(`${config.API_URL}/api/admin/users/${email}`, { method: 'DELETE' });
            if (res.ok) {
                setUsersList(usersList.filter(u => u.email !== email));
                setLeaderboard(leaderboard.filter(u => u.email !== email));
                alert("User removed.");
            }
        } catch (e) {
            console.error("Failed to delete user", e);
        }
    };

    const handleUpdateUser = async () => {
        try {
            const res = await fetch(`${config.API_URL}/api/admin/users/${editingUser.email}`, {
                method: 'PUT',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                const updatedUser = await res.json();
                setUsersList(usersList.map(u => u.email === updatedUser.email ? updatedUser : u));
                setEditingUser(null);
                alert("User successfully updated!");
            }
        } catch (e) {
            alert("Error updating user.");
        }
    };

    const currentRecords = getCurrentRecords();

    return (
        <div className={`dash-layout ${theme}`}>
            <aside className="dash-sidebar">
                <div className="dash-logo">
                    <h2>Admin <span>Panel</span></h2>
                </div>
                <nav className="dash-nav">
                    <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
                        <LayoutDashboard size={20} /> Overview
                    </button>
                    <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
                        <Users size={20} /> Manage Users
                    </button>
                    <button className={activeTab === "questions" ? "active" : ""} onClick={() => setActiveTab("questions")}>
                        <Database size={20} /> Manage Questions
                    </button>
                </nav>
                <div className="dash-footer-nav">
                    <Link to="/home"><Home size={20} /> Return App</Link>
                    <button onClick={() => {
                        localStorage.removeItem('isAdmin');
                        localStorage.removeItem('userEmail');
                        localStorage.removeItem('userName');
                        window.location.href = '/';
                    }} className="logout-btn"><LogOut size={20} /> Logout</button>
                </div>
            </aside>

            <main className="dash-main">

                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                    <div className="dash-overview animated fadeIn">
                        <header className="dq-header">
                            <div>
                                <h1>Dashboard</h1>
                                <p>High-level metrics and platform leaderboards.</p>
                            </div>
                        </header>

                        <div className="stats-grid">
                            <div className="stat-card stat-primary">
                                <div className="stat-icon"><Users /></div>
                                <div className="stat-info">
                                    <h3>Total Players</h3>
                                    <div className="stat-value">{usersList.length}</div>
                                </div>
                            </div>
                            <div className="stat-card stat-secondary">
                                <div className="stat-icon"><Database /></div>
                                <div className="stat-info">
                                    <h3>Game Questions</h3>
                                    <div className="stat-value">{getTotalQuestionsCount()}+</div>
                                </div>
                            </div>
                            <div className="stat-card stat-tertiary">
                                <div className="stat-icon"><Award /></div>
                                <div className="stat-info">
                                    <h3>Top Point Score</h3>
                                    <div className="stat-value">{leaderboard.length > 0 ? leaderboard[0].totalPoints : 0}</div>
                                </div>
                            </div>
                        </div>

                        <div className="dash-panels-grid">
                            <div className="dash-panel">
                                <div className="panel-header">
                                    <h2>Global Leaderboard</h2>
                                    <span className="panel-badge">Top 10 Live</span>
                                </div>
                                <table className="dash-table">
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Name</th>
                                            <th className="text-right">Total Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map((user, i) => (
                                            <tr key={user._id}>
                                                <td><span className={`rank-badge rank-${i + 1}`}>{i + 1}</span></td>
                                                <td className="font-semibold">{user.name}</td>
                                                <td className="text-right numtext text-blue">{user.totalPoints.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="dash-panel quick-actions-panel">
                                <h2>Recent Admin Logs</h2>
                                <div className="logs-list">
                                    <div className="log-item">
                                        <div className="log-dot success"></div>
                                        <span>System boot verified and connected to S8Project DB</span>
                                    </div>
                                    <div className="log-item">
                                        <div className="log-dot info"></div>
                                        <span>MongoDB dynamic fetching linked successfully</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* MANAGE USERS TAB */}
                {activeTab === "users" && (
                    <div className="dash-users animated fadeIn">
                        <header className="dq-header">
                            <div>
                                <h1>User Repository</h1>
                                <p>Modify global user data and clean up inactive accounts.</p>
                            </div>
                        </header>

                        {viewingUser ? (
                            <div className="view-user-panel dash-panel">
                                <div className="panel-header">
                                    <h2>User Details: {viewingUser.name}</h2>
                                    <button className="icon-btn-close" onClick={() => setViewingUser(null)}><XSquare /></button>
                                </div>
                                <div className="user-details-grid">
                                    <div className="detail-section">
                                        <h3>Basic Information</h3>
                                        <div className="detail-item"><strong>Name:</strong> {viewingUser.name}</div>
                                        <div className="detail-item"><strong>Email:</strong> {viewingUser.email}</div>
                                        <div className="detail-item"><strong>Date of Birth:</strong> {viewingUser.dob || 'Not provided'}</div>
                                        <div className="detail-item"><strong>Profile Image:</strong> {viewingUser.profileImage ? <img src={viewingUser.profileImage} alt="Profile" style={{width: '50px', height: '50px', borderRadius: '50%'}} /> : 'No image'}</div>
                                        <div className="detail-item"><strong>Joined:</strong> {new Date(viewingUser.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div className="detail-section">
                                        <h3>Activity Summary</h3>
                                        <div className="detail-item"><strong>Total Points:</strong> {viewingUser.totalPoints}</div>
                                        <div className="detail-item"><strong>Games Played:</strong> {viewingUser.gamesPlayed}</div>
                                        <div className="detail-item"><strong>Articles Read:</strong> {viewingUser.articlesRead}</div>
                                    </div>
                                    <div className="detail-section">
                                        <h3>Category Mastery</h3>
                                        <div className="detail-item"><strong>Executive:</strong> {viewingUser.mastery?.executive || 0}%</div>
                                        <div className="detail-item"><strong>Legislature:</strong> {viewingUser.mastery?.legislature || 0}%</div>
                                        <div className="detail-item"><strong>Judiciary:</strong> {viewingUser.mastery?.judiciary || 0}%</div>
                                    </div>
                                    <div className="detail-section">
                                        <h3>Points Breakdown</h3>
                                        <div className="detail-item"><strong>Article Match:</strong> {viewingUser.pointsBreakdown?.articleMatch || 0}</div>
                                        <div className="detail-item"><strong>Rights Duties Climb:</strong> {viewingUser.pointsBreakdown?.rightsDutiesClimb || 0}</div>
                                        <div className="detail-item"><strong>Constitution Cards:</strong> {viewingUser.pointsBreakdown?.constitutionCards || 0}</div>
                                        <div className="detail-item"><strong>Chakra of Knowledge:</strong> {viewingUser.pointsBreakdown?.chakra || 0}</div>
                                        <div className="detail-item"><strong>Learn:</strong> {viewingUser.pointsBreakdown?.learn || 0}</div>
                                        <div className="detail-item"><strong>Quiz:</strong> {viewingUser.pointsBreakdown?.quiz || 0}</div>
                                        <div className="detail-item"><strong>Constitutional Sort:</strong> {viewingUser.pointsBreakdown?.sort || 0}</div>
                                        <div className="detail-item"><strong>Crossroads:</strong> {viewingUser.pointsBreakdown?.crossroads || 0}</div>
                                        <div className="detail-item"><strong>Justice Jury:</strong> {viewingUser.pointsBreakdown?.justiceJury || 0}</div>
                                        <div className="detail-item"><strong>Reverse Hangman:</strong> {viewingUser.pointsBreakdown?.reverseHangman || 0}</div>
                                    </div>
                                    <div className="detail-section">
                                        <h3>Completed Levels</h3>
                                        <div className="completed-levels">
                                            <div><strong>Article Match:</strong> {viewingUser.completedLevels?.articleMatch?.join(', ') || 'None'}</div>
                                            <div><strong>Rights Duties Climb:</strong> {viewingUser.completedLevels?.rightsDutiesClimb?.join(', ') || 'None'}</div>
                                            <div><strong>Constitution Cards:</strong> {viewingUser.completedLevels?.constitutionCards?.join(', ') || 'None'}</div>
                                            <div><strong>Chakra:</strong> {viewingUser.completedLevels?.chakra?.join(', ') || 'None'}</div>
                                            <div><strong>Quiz:</strong> {viewingUser.completedLevels?.quiz?.join(', ') || 'None'}</div>
                                            <div><strong>Sort:</strong> {viewingUser.completedLevels?.sort?.join(', ') || 'None'}</div>
                                            <div><strong>Crossroads:</strong> {viewingUser.completedLevels?.crossroads?.join(', ') || 'None'}</div>
                                            <div><strong>Justice Jury:</strong> {viewingUser.completedLevels?.justiceJury?.join(', ') || 'None'}</div>
                                            <div><strong>Reverse Hangman:</strong> {viewingUser.completedLevels?.reverseHangman?.join(', ') || 'None'}</div>
                                        </div>
                                    </div>
                                    <div className="detail-section">
                                        <h3>Achievements</h3>
                                        <div className="achievements-list">
                                            {viewingUser.totalPoints > 1000 && <div className="achievement">🏆 High Scorer (1000+ points)</div>}
                                            {viewingUser.gamesPlayed > 50 && <div className="achievement">🎮 Game Master (50+ games)</div>}
                                            {viewingUser.articlesRead > 20 && <div className="achievement">📚 Knowledge Seeker (20+ articles)</div>}
                                            {Object.values(viewingUser.mastery || {}).some(m => m >= 80) && <div className="achievement">🎓 Category Expert (80%+ mastery)</div>}
                                            {Object.values(viewingUser.completedLevels || {}).some(levels => levels.length > 10) && <div className="achievement">⭐ Completionist (10+ levels in a game)</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : editingUser ? (
                            <div className="edit-user-panel dash-panel">
                                <div className="panel-header">
                                    <h2>Editing User: {editingUser.name}</h2>
                                    <button className="icon-btn-close" onClick={() => setEditingUser(null)}><XSquare /></button>
                                </div>
                                <div className="edit-form-grid">
                                    <div className="form-field">
                                        <label>Name</label>
                                        <input className="dash-input" value={editForm.name || ""} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                    </div>
                                   
                                </div>
                                <div className="action-row">
                                    <button className="dash-submit-btn" onClick={handleUpdateUser}>Update Record</button>
                                </div>
                            </div>
                        ) : (
                            <div className="dash-panel">
                                <table className="dash-table full-table">
                                    <thead>
                                        <tr>
                                            <th>User Info</th>
                                            <th>Points</th>
                                            <th>Engagement</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersList.map((user) => (
                                            <tr key={user.email}>
                                                <td>
                                                    <div className="user-cell">
                                                        <strong>{user.name}</strong>
                                                        <span className="user-email">{user.email}</span>
                                                    </div>
                                                </td>
                                                <td className="numtext text-blue font-semibold">{user.totalPoints}</td>
                                                <td>
                                                    <div className="engagement-cell">
                                                        <span>{user.gamesPlayed} games</span>
                                                        <span className="dot">•</span>
                                                        <span>{user.articlesRead} arts</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="icon-btn view-btn" onClick={() => setViewingUser(user)}><Eye size={16} /></button>
                                                        <button className="icon-btn edit-btn" onClick={() => {
                                                            setEditingUser(user);
                                                            setEditForm({ name: user.name, totalPoints: user.totalPoints, articlesRead: user.articlesRead, gamesPlayed: user.gamesPlayed });
                                                        }}><Edit size={16} /></button>
                                                        <button className="icon-btn delete-btn" onClick={() => handleDeleteUser(user.email)}><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}


                {/* MANAGE QUESTIONS TAB */}
                {activeTab === "questions" && (
                    <div className="dash-questions animated fadeIn">
                        <header className="dq-header">
                            <div>
                                <h1>Question Management</h1>
                                <p>Add dynamic content using specific fields directly mapped to your backend JSON databases.</p>
                            </div>
                        </header>

                        <div className="dq-content-grid">
                            <div className="dq-left-col">
                                <div className="form-head">
                                    <FileText size={20} /> Form Builder
                                </div>
                                <div className="control-group">
                                    <label>1. Select Target Game:</label>
                                    <div className="game-select-chips">
                                        <select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)} className="dash-select">
                                            {gamesList.map(g => (
                                                <option key={g.id} value={g.id}>{g.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {!gamesList.find(g => g.id === selectedGame)?.isFlat && (
                                    <div className="control-group">
                                        <label>2. Target Difficulty Base:</label>
                                        <div className="diff-tabs">
                                            {['Easy', 'Medium', 'Hard'].map(level => (
                                                <button
                                                    key={level}
                                                    className={`diff-tab-btn ${inputDifficulty === level ? 'active' : ''}`}
                                                    onClick={() => setInputDifficulty(level)}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="dynamic-form">
                                    <label className="section-label">3. Fill Content Fields:</label>
                                    {(schemas[selectedGame] || []).map(field => (
                                        <div key={field.key} className="form-field">
                                            <label>{field.label || field.key}</label>
                                            {field.type === 'textarea' ? (
                                                <textarea value={formData[field.key] || ""} onChange={e => handleFormChange(field.key, e.target.value)} placeholder={`Enter ${field.key}...`} className="dash-input textarea" rows={3} />
                                            ) : field.type === 'select' ? (
                                                <select value={formData[field.key] ?? ""} onChange={e => handleFormChange(field.key, e.target.value)} className="dash-select">
                                                    {field.options && field.options.map((opt, i) => (
                                                        <option key={i} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input type={field.type === 'number' ? 'number' : 'text'} value={formData[field.key] ?? (field.type === 'number' ? 0 : "")} onChange={e => handleFormChange(field.key, e.target.value)} placeholder={`Enter ${field.key}...`} className="dash-input" />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {statusMsg && (
                                    <div className={`status-banner ${statusMsg.includes('✅') ? 'success' : 'error'}`}>
                                        {statusMsg}
                                    </div>
                                )}

                                <button className="dash-submit-btn" onClick={handleAddQuestion} disabled={isSubmitting}>
                                    {isSubmitting ? "Pushing securely..." : <><CheckCircle2 size={18} /> {editingQuestionId ? "Update Record" : "Submit Record"}</>}
                                </button>
                                {editingQuestionId && (
                                    <button className="dash-submit-btn" style={{ marginTop: '10px', background: '#94a3b8' }} onClick={() => { setEditingQuestionId(null); setStatusMsg(""); }}>
                                        Cancel Edit
                                    </button>
                                )}
                            </div>

                            <div className="dq-right-col">
                                <div className="preview-card-wrapper">
                                    <h3>Available Live Questions <span className="badge">{currentRecords.length}</span></h3>
                                    <div className="preview-list">
                                        {currentRecords.map((rec, idx) => (
                                            <div key={idx} className="preview-item-formatted">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', overflow:'visible' }}>
                                                    <h4 className="preview-item-title" style={{ marginBottom: 0 }}>
                                                        {rec.question || rec.title || rec.word || rec.text || rec.article || `Item ID: ${rec.id}`}
                                                    </h4>
                                                    {rec._mongoId && (
                                                        <button
                                                            className="icon-btn edit-btn"
                                                            style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}
                                                            onClick={() => handleEditQuestionClick(rec)}>
                                                            <Edit size={16} /> Edit
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="preview-item-details">
                                                    {Object.keys(rec).map(k => {
                                                        if (['question', 'title', 'word', 'text', 'article', 'id', 'difficulty', '_mongoId'].includes(k)) return null;
                                                        let displayVal = rec[k];
                                                        if (Array.isArray(displayVal)) displayVal = displayVal.map(d => typeof d === 'object' ? d.text || JSON.stringify(d) : d).join(", ");
                                                        else if (typeof displayVal === 'object') displayVal = JSON.stringify(displayVal);
                                                        return (
                                                            <div key={k} className="detail-row">
                                                                <span className="detail-key">{k}:</span>
                                                                <span className="detail-val">{displayVal}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                        {currentRecords.length === 0 && (
                                            <div className="empty-state">
                                                <Database size={40} opacity={0.3} />
                                                <p>No questions mapped here yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}