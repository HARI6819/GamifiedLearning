import { createContext, useState, useContext, useEffect } from 'react';
import translations from '../data/translations';
import useTranslate from '../hooks/useTranslate';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('en'); // default to 'en'

    useTranslate(language); // Apply API translation when language changes

    const changeLanguage = (newLang) => {
        setLanguage(newLang);
    };

    // Always English as base; API hook translates everything including Hindi
    const t = translations['en'];

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
