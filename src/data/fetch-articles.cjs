const fs = require('fs');
const https = require('https');
const { GoogleGenAI } = require('@google/genai');

const DATA_URL = 'https://raw.githubusercontent.com/civictech-India/constitution-of-india/master/constitution_of_india.json';
const OUTPUT_FILE = 'e:\\Project\\AntiS8\\src\\data\\articles.json';

// Initialize the Gemini AI client. Ensure GEMINI_API_KEY is an environment variable.
const ai = new GoogleGenAI({});

// Simple function to fetch JSON
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// Ensure the prompt generates a valid JSON string
async function generateArticleData(title, description) {
    const prompt = `You are an expert on the Indian Constitution. I have an article.
Title: ${title}
Description: ${description}

Please provide the following information formatted strictly as a valid JSON object. Do not include markdown code block formatting like \`\`\`json.
The JSON object must have the following keys:
1. "title_hi": Hindi translation of the title.
2. "desc_en": The original description or a professionally slightly shortened version if it's very long.
3. "desc_hi": Hindi translation of the description.
4. "simplifiedText_en": A very simple, easy-to-understand explanation of the article in English (2-3 sentences max).
5. "simplifiedText_hi": Hindi translation of the simplified text.
6. "example_en": A single, practical, real-life example illustrating the article in English.
7. "example_hi": Hindi translation of the example.
8. "funFact_en": A short fun fact or trivia related to the article in English.
9. "funFact_hi": Hindi translation of the fun fact.

Ensure the output is ONLY a parseable JSON object.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        let responseText = response.text;

        try {
            const result = JSON.parse(responseText);
            return result;
        } catch (parseError) {
            console.error("Failed to parse JSON for article:", title, responseText);
            return null;
        }

    } catch (error) {
        console.error('Error generating data for article:', title, error);
        return null; // Return null if the API call fails
    }
}


async function main() {
    console.log('Fetching Indian Constitution data from civictech-India...');
    let data;
    try {
        data = await fetchJson(DATA_URL);
    } catch (e) {
        console.error('Failed to fetch data.', e);
        return;
    }

    const targetArticles = [];

    // Filter articles from 52 to 237
    for (const item of data) {
        const artNoStr = String(item.article || '');
        const match = artNoStr.match(/^(\d+)/);
        if (match) {
            const no = parseInt(match[1], 10);
            if (no >= 52 && no <= 237) {
                targetArticles.push(item);
            }
        }
    }

    // Sort them by article number just in case
    targetArticles.sort((a, b) => {
        const noA = parseInt(String(a.article).match(/^(\d+)/)[1], 10);
        const noB = parseInt(String(b.article).match(/^(\d+)/)[1], 10);
        return noA - noB;
    });

    console.log(`Found ${targetArticles.length} articles matching Part V and Part VI.`);
    console.log('Generating detailed translations and extra fields using Gemini (this will take a while)...');

    const finalData = [];

    for (let i = 0; i < targetArticles.length; i++) {
        const item = targetArticles[i];
        const artNo = item.article;
        const titleEn = item.title || '';
        const descEn = item.description || '';

        // Determine part
        const no = parseInt(String(artNo).match(/^(\d+)/)[1], 10);
        const part = (no >= 52 && no <= 151) ? 'V' : 'VI';

        console.log(`[${i + 1}/${targetArticles.length}] Processing Article ${artNo}: ${titleEn}`);

        const genData = await generateArticleData(titleEn, descEn);

        if (genData) {
            finalData.push({
                id: String(artNo),
                part: part,
                title_en: titleEn,
                title_hi: genData.title_hi || '',
                desc_en: genData.desc_en || descEn,
                desc_hi: genData.desc_hi || '',
                simplifiedText_en: genData.simplifiedText_en || '',
                simplifiedText_hi: genData.simplifiedText_hi || '',
                example_en: genData.example_en || '',
                example_hi: genData.example_hi || '',
                funFact_en: genData.funFact_en || '',
                funFact_hi: genData.funFact_hi || ''
            });
        } else {
            // Fallback if API fails
            finalData.push({
                id: String(artNo),
                part: part,
                title_en: titleEn,
                title_hi: '',
                desc_en: descEn,
                desc_hi: '',
                simplifiedText_en: 'Information not fully available.',
                simplifiedText_hi: 'जानकारी पूरी तरह से उपलब्ध नहीं है।',
                example_en: 'Example not available.',
                example_hi: 'उदाहरण उपलब्ध नहीं है।',
                funFact_en: 'Fun fact not available.',
                funFact_hi: 'रोचक तथ्य उपलब्ध नहीं है।'
            });
        }

        // Small delay to avoid hammering the API too aggressively even if limits might allow it
        await new Promise(r => setTimeout(r, 1000));
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData, null, 2), 'utf-8');
    console.log(`Successfully saved all ${finalData.length} articles with extra fields to ${OUTPUT_FILE}`);
}

main().catch(console.error);
