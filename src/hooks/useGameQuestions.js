import { useState, useEffect } from 'react';
import config from '../config';

export function useGameQuestions(gameKey, localData, isFlat = true, nestedKey = null) {
    const [data, setData] = useState(localData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRemote = async () => {
            try {
                const res = await fetch(`${config.API_URL}/api/questions?gameKey=${gameKey}`, {
                    headers: { "ngrok-skip-browser-warning": "true" }
                });

                if (res.ok) {
                    const remoteData = await res.json();

                    if (isFlat) {
                        // For flat arrays (like Cards, Chakra)
                        const newItems = remoteData.map(r => r.questionData);
                        setData(prev => [...prev, ...newItems]);
                    } else {
                        // For difficulty nested datasets
                        const merged = JSON.parse(JSON.stringify(localData)); // deep copy local data

                        remoteData.forEach(r => {
                            const diff = r.difficulty || r.questionData.difficulty;

                            if (nestedKey) {
                                // e.g. hangman has data.words.Easy
                                if (!merged[nestedKey]) merged[nestedKey] = { Easy: [], Medium: [], Hard: [] };
                                if (!merged[nestedKey][diff]) merged[nestedKey][diff] = [];
                                merged[nestedKey][diff].push(r.questionData);
                            } else {
                                // e.g. quiz has data.Easy
                                if (!merged[diff]) merged[diff] = [];
                                merged[diff].push(r.questionData);
                            }
                        });

                        setData(merged);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch remote dynamic questions for", gameKey, e);
            } finally {
                setLoading(false);
            }
        };

        fetchRemote();
    }, [gameKey, localData, isFlat, nestedKey]);

    return { data, loading };
}
