import React, { useState, useEffect } from 'react';
import './ConnectivityToast.css';

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
            {status === 'offline' ? '⚠️ You are offline' : '🌐 Back to online'}
        </div>
    );
};

export default ConnectivityToast;
