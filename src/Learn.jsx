import { useEffect, useState, useRef } from "react";
import "./Learn.css";
// import articlesData from "./data/articles.json";
import Navbar from './Navbar'
import Footer from "./Footer";
import { BookOpen, Search, X, ArrowLeft, MoveRight } from "lucide-react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useLanguage } from "./context/LanguageContext";
import { articleTranslations } from "./data/articleTranslations";
import config from "./config";


const Learn = () => {
    const { t, language } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedCategory = searchParams.get("category");

    const [articlesData, setArticlesData] = useState([]);
    const [search1, setSearch] = useState("");
    const [organ, setOrgan] = useState("all");
    const [loading, setLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const activeCardRef = useRef(null);

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
                    totalPoints: 5,
                    gameId: "learn",
                    mastery: { [category.toLowerCase()]: 5 }
                })
            });
        } catch (e) {
            console.error("Failed to update progress", e);
        }
    };

    const handleArticleClick = (article) => {
        setSelectedArticle(article);
    };

    useEffect(() => {
        async function fetchArticalData() {
            try {
                const datas = await fetch(`${config.API_URL}/api/articles`, {
                    headers: {
                        "ngrok-skip-browser-warning": "true"
                    }
                });
                const articlesData = await datas.json();
                setArticlesData(articlesData);
            } catch (error) {
                console.error("Failed to fetch articles:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchArticalData();
    }, []);

    const filteredArticles = articlesData.filter(article => {
        const matchesSearch =
            article.title.toLowerCase().includes(search1.toLowerCase()) ||
            article.simplifiedText.toLowerCase().includes(search1.toLowerCase()) ||
            article.number.includes(search1);

        const matchesCategory =
            !selectedCategory || article.category === selectedCategory;

        const matchesOrgan =
            organ === "all" || article.organ === organ;

        return matchesSearch && matchesCategory && matchesOrgan;
    });

    // Auto-select first article when category changes
    useEffect(() => {
        if (selectedCategory && filteredArticles.length > 0 && !selectedArticle) {
            setSelectedArticle(filteredArticles[0]);
        }
    }, [selectedCategory, filteredArticles, selectedArticle]);

    // Handle auto-scroll to active card in mobile view
    useEffect(() => {
        if (selectedArticle && activeCardRef.current && window.innerWidth <= 1024) {
            activeCardRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [selectedArticle]);

    // Track 10-second read progress
    useEffect(() => {
        if (!selectedArticle) return;

        const timer = setTimeout(() => {
            updateProgress(selectedArticle.category);
        }, 10000);

        return () => clearTimeout(timer);
    }, [selectedArticle]);

    // Helper to get translated article data
    const getTranslatedArticle = (article) => {
        if (language === 'hi' && articleTranslations[article.id]) {
            return { ...article, ...articleTranslations[article.id] };
        }
        return article;
    };

    // Helper to translate category/organ/difficulty
    const getTranslatedString = (key, type) => {
        if (!key) return "";
        const lowerKey = key.toLowerCase();

        if (type === 'category') {
            return t.learn.filters[lowerKey] || key;
        }
        if (type === 'organ') {
            return t.learn.filters[lowerKey] || key;
        }
        if (type === 'difficulty') {
            return t.common.difficulty[key] || key;
        }
        return key;
    };

    const organs = [
        {
            id: "Legislature",
            icon: "📜",
            title: t.learn.filters.legislature,
            desc: t.home.pillars.legislature.desc,
            color: "orange"
        },
        {
            id: "Executive",
            icon: "🏛️",
            title: t.learn.filters.executive,
            desc: t.home.pillars.executive.desc,
            color: "blue"
        },
        {
            id: "Judiciary",
            icon: "⚖️",
            title: t.learn.filters.judiciary,
            desc: t.home.pillars.judiciary.desc,
            color: "green"
        }
    ];

    const handleCategorySelect = (id) => {
        setSearchParams({ category: id });
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        setSearchParams({});
        setSearch("");
        setOrgan("all");
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading legal knowledge...</p>
            </div>
        );
    }

    return (
        <>
            <section className="section1">
                <Navbar />
            </section>

            <section className="LearnSection">
                <div className="learn-page">
                    <div className="badge1">
                        <BookOpen className="badge1-icon" />
                        <span>{t.learn.badge}</span>
                    </div>

                    <div className="learn-header">
                        <h1 className="title">{t.learn.title}</h1>
                        <p className="subtitle">
                            {t.learn.subtitle}
                        </p>
                    </div>
                </div>
                {!selectedCategory ? (
                    /* View 1: Category Selection */
                    <div className="category-grid">
                        {organs.map(org => (
                            <div
                                key={org.id}
                                className={`category-hero-card ${org.color}`}
                                onClick={() => handleCategorySelect(org.id)}
                            >
                                <div>
                                    <div className="hero-card-icon">{org.icon}</div>
                                    <div className="hero-card-content">

                                        <h3>{org.title}</h3>
                                        <p>{org.desc}</p>
                                    </div>
                                </div>
                                <div className="explore-btn">
                                    <span>{t.home.pillars.explore}</span>
                                    <MoveRight size={18} />
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    /* View 2: Article List (Split-Pane Explorer) */
                    <div className="detailed-articles-view">
                        <div className="detailed-view-header">
                            <button className="back-to-selection" onClick={handleBack}>
                                <ArrowLeft size={20} />
                                <span>{t.login.back}</span>
                            </button>

                            <div className="current-category-header">
                                <div className="category-info">
                                    <span className={`category-tag ${selectedCategory}`}>
                                        {organs.find(o => o.id === selectedCategory)?.icon} {organs.find(o => o.id === selectedCategory)?.title} {t.learn.filters.articles}
                                    </span>
                                </div>
                            </div>

                            {/* Global Filters: Search & Organ (Union/State) */}
                            <div className="global-filters">
                                <div className="search-wrapper">
                                    <Search className="search-icon" size={20} />
                                    <input
                                        className="search-box"
                                        placeholder={t.learn.searchPlaceholder}
                                        value={search1}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                <div className="filters secondary">
                                    <button onClick={() => setOrgan("all")} className={organ === "all" ? "active" : ""}>{t.learn.filters.all}</button>
                                    <button onClick={() => setOrgan("Union")} className={organ === "Union" ? "active" : ""}>🇮🇳 {t.learn.filters.union}</button>
                                    <button onClick={() => setOrgan("State")} className={organ === "State" ? "active" : ""}>🏛️ {t.learn.filters.state}</button>
                                </div>
                                <div className="label-showing-box">
                                    <p className="label-showing">{t.learn.showing} {filteredArticles.length} {t.learn.articles}</p>
                                </div>
                            </div>
                        </div>

                        <div className="explorer-layout">
                            {/* Left Pane: Article Cards (Horizontal scroll on Tablet/Mobile) */}
                            <div className="article-sidebar">
                                <div className="articles detailed-grid">
                                    {filteredArticles.length > 0 ? (
                                        filteredArticles.map(article => {
                                            const translatedArticle = getTranslatedArticle(article);
                                            const isActive = selectedArticle?.id === article.id;
                                            return (
                                                <div
                                                    className={`article-card ${article.category} clickable ${isActive ? 'active-card' : ''}`}
                                                    key={article.id}
                                                    ref={isActive ? activeCardRef : null}
                                                    onClick={() => handleArticleClick(article)}
                                                >
                                                    <div className="badges">
                                                        <span className="badge outline">{getTranslatedString(article.organ, 'organ')}</span>
                                                        <span className="badge outline">Part {article.originalPart}</span>
                                                    </div>

                                                    <h3 className="ArticleLine">
                                                        <span className="article-number">Article {article.number}</span>
                                                        <span className="article-title"> — {translatedArticle.title}</span>
                                                    </h3>
                                                    <p className="read-more">View summary</p>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="no-results">
                                            <p>{t.learn.noArticlesFound}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Pane: Article Details Content */}
                            <div className="article-details-pane">
                                {selectedArticle ? (
                                    <div className="details-content-card">
                                        <div className="details-header">
                                            <span className={`popup-badge ${selectedArticle.category}`}>
                                                {getTranslatedString(selectedArticle.category, 'category')}
                                            </span>
                                            <span className="popup-badge outline">
                                                {getTranslatedString(selectedArticle.organ, 'organ')}
                                            </span>
                                        </div>

                                        <h2 className="details-title">
                                            <span className="details-article-num">Article {selectedArticle.number}</span>
                                            <br />
                                            {getTranslatedArticle(selectedArticle).title}
                                        </h2>

                                        <div className="details-body">
                                            <div className="summary-block">
                                                <h4>Description</h4>
                                                <p className="details-description">
                                                    {getTranslatedArticle(selectedArticle).simplifiedText}
                                                </p>
                                            </div>

                                            {getTranslatedArticle(selectedArticle).funFact && (
                                                <div className="details-fun-fact">
                                                    <h4>💡 {t.learn.funFact}</h4>
                                                    <p>{getTranslatedArticle(selectedArticle).funFact}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="details-footer">
                                            <div className="meta-tags">
                                                <span>Part {selectedArticle.originalPart}</span>
                                                <span>{getTranslatedString(selectedArticle.difficulty, 'difficulty')}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-selection-state">
                                        <BookOpen size={48} />
                                        <p>Select an article from the list to view its summary.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Article Detail Popup (Fallback/Mobile Only) */}
                {/* User requested side-by-side split view for this category explorer */}
            </section>
            <section>
                <Footer />
            </section>
        </>
    );
};

export default Learn;
