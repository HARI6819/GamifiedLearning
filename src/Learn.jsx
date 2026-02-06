import { useEffect, useState } from "react";
import "./Learn.css";
// import articlesData from "./data/articles.json";
import Navbar from './Navbar'
import Footer from "./Footer";
import { BookOpen, Search, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "./context/LanguageContext";
import { articleTranslations } from "./data/articleTranslations";
import config from "./config";


const Learn = () => {
    const { t, language } = useLanguage();
    const [articlesData, setArticlesData] = useState([]);
    const [search1, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [organ, setOrgan] = useState("all");
    const [loading, setLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState(null);

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
                    mastery: { [category.toLowerCase()]: 2 }
                })
            });
        } catch (e) {
            console.error("Failed to update progress", e);
        }
    };

    const handleArticleClick = (article) => {
        setSelectedArticle(article);
        updateProgress(article.category);
    };

    const { search } = useLocation();
    const params = new URLSearchParams(search);

    const query = params.get("category");

    useEffect(() => {
        if (query) {
            const formatedData = query.charAt(0).toUpperCase() + query.substring(1);
            setCategory(formatedData);
        }

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
            category === "all" || article.category === category;

        const matchesOrgan =
            organ === "all" || article.organ === organ;

        return matchesSearch && matchesCategory && matchesOrgan;
    });

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
        // Map API values to translation keys if necessary (lowercase for keys)
        const lowerKey = key.toLowerCase();

        if (type === 'category') {
            // 'Legislature' -> t.learn.filters.legislature
            return t.learn.filters[lowerKey] || key;
        }
        if (type === 'organ') {
            // 'Union' -> t.learn.filters.union
            // 'State' -> t.learn.filters.state
            return t.learn.filters[lowerKey] || key;
        }
        if (type === 'difficulty') {
            return t.common.difficulty[key] || key;
        }
        return key;
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
                    <div>
                        <h1 className="title">{t.learn.title}</h1>
                        <p className="subtitle">
                            {t.learn.subtitle}
                        </p>

                        {/* Search */}

                        <input
                            className="search-box"
                            placeholder={t.learn.searchPlaceholder}
                            value={search1}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {/* Filters */}
                        <div className="filters">
                            <button onClick={() => setCategory("all")} className={category === "all" ? "active" : ""}>{t.learn.filters.allCategories}</button>
                            <button onClick={() => setCategory("Legislature")} className={category === "Legislature" ? "active" : ""}>📜 {t.learn.filters.legislature}</button>
                            <button onClick={() => setCategory("Executive")} className={category === "Executive" ? "active" : ""}>🏛️ {t.learn.filters.executive}</button>
                            <button onClick={() => setCategory("Judiciary")} className={category === "Judiciary" ? "active" : ""}>⚖️ {t.learn.filters.judiciary}</button>
                        </div>

                        <div className="filters secondary">
                            <button onClick={() => setOrgan("all")} className={organ === "all" ? "active" : ""}>{t.learn.filters.all}</button>
                            <button onClick={() => setOrgan("Union")} className={organ === "Union" ? "active" : ""}>🇮🇳 {t.learn.filters.union}</button>
                            <button onClick={() => setOrgan("State")} className={organ === "State" ? "active" : ""}>🏛️ {t.learn.filters.state}</button>
                        </div>

                        <p className="count">{t.learn.showing} {filteredArticles.length} {t.learn.articles}</p>

                        {/* Articles */}
                        <div className="articles">
                            {filteredArticles.map(article => {
                                const translatedArticle = getTranslatedArticle(article);
                                return (
                                    <div
                                        className={`article-card ${article.category} clickable`}
                                        key={article.id}
                                        onClick={() => handleArticleClick(article)}
                                    >
                                        <div className="badges">
                                            <span className="badge outl">{getTranslatedString(article.category, 'category')}</span>
                                            <span className="badge outline">{getTranslatedString(article.organ, 'organ')}</span>
                                            <span className="badge outline">Part {article.originalPart}</span>
                                        </div>

                                        <h3 className="ArticleLine">
                                            <span className="article-number">Article {article.number}</span> — {translatedArticle.title}
                                        </h3>
                                        <p style={{ color: "grey" }}>Read more...</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Article Detail Popup */}
                {selectedArticle && (
                    <div className="article-popup-overlay" onClick={() => setSelectedArticle(null)}>
                        <div className="article-popup-content" onClick={e => e.stopPropagation()}>
                            <button className="popup-close-btn" onClick={() => setSelectedArticle(null)}>
                                <X size={24} />
                            </button>

                            <div className="popup-header">
                                <span className={`popup-badge ${selectedArticle.category}`}>
                                    {getTranslatedString(selectedArticle.category, 'category')}
                                </span>
                                <span className="popup-badge outline">
                                    {getTranslatedString(selectedArticle.organ, 'organ')}
                                </span>
                            </div>

                            <h2 className="popup-title">
                                <span className="popup-article-num">Article {selectedArticle.number}</span>
                                <br />
                                {getTranslatedArticle(selectedArticle).title}
                            </h2>

                            <div className="popup-body">
                                <p className="popup-description">
                                    {getTranslatedArticle(selectedArticle).simplifiedText}
                                </p>

                                {getTranslatedArticle(selectedArticle).funFact && (
                                    <div className="popup-fun-fact">
                                        <h4>💡 {t.learn.funFact}</h4>
                                        <p>{getTranslatedArticle(selectedArticle).funFact}</p>
                                    </div>
                                )}
                            </div>

                            <div className="popup-footer">
                                <span>Part {selectedArticle.originalPart}</span>
                                <span>{getTranslatedString(selectedArticle.difficulty, 'difficulty')}</span>
                            </div>
                        </div>
                    </div>
                )}
            </section>
            <section>
                <Footer />
            </section>
        </>
    );
};

export default Learn;
