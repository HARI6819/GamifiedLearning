
import './Footer.css'
import { useLanguage } from './context/LanguageContext';
import TranslatedText from './TranslatedText';

function Footer() {
    const { t } = useLanguage();
    return (
        <>
            <div className='footer'>
                <p><TranslatedText>{t.home.footer.madeWith}</TranslatedText></p>
                <p><TranslatedText>{t.home.footer.parts}</TranslatedText></p>
                <p><TranslatedText>{t.home.footer.hindi}</TranslatedText></p>
            </div>
        </>
    )
}

export default Footer