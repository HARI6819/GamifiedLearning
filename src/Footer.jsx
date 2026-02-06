
import './Footer.css'
import { useLanguage } from './context/LanguageContext';

function Footer() {
    const { t } = useLanguage();
    return (
        <>
            <div className='footer'>
                <p>{t.home.footer.madeWith}</p>
                <p>{t.home.footer.parts}</p>
                <p>{t.home.footer.hindi}</p>
            </div>
        </>
    )
}

export default Footer