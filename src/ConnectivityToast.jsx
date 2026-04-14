import React, { useState, useEffect } from 'react';
import './ConnectivityToast.css';
import TranslatedText from './TranslatedText';

const ConnectivityToast = () => {
    const [status, setStatus] = useState(null); // 'online', 'offline', or null
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setStatus('online');
            setVisible(true);
            setTimeout(() => setVisible(false), 5000);
        };

        const handleOffline = () => {
            setStatus('offline');
            setVisible(true);
            setTimeout(() => setVisible(false), 5000);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!status) return null;

    return (
        <div className={`connectivity-toast ${status} ${visible ? 'visible' : ''}`}>
            {status === 'offline' ? <TranslatedText>⚠️ You are offline</TranslatedText> : <TranslatedText>🌐 Back to online</TranslatedText>}
        </div>
    );
};

export default ConnectivityToast;
