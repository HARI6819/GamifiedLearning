import { translations } from 'file:///e:/Project/Antis8Backup/src/data/translations.js';
import fs from 'fs';

const en = translations.en;

function saveJSON(filename, data) {
    if (!data) { console.warn('Missing data for ', filename); return; }
    fs.writeFileSync(`e:/Project/Antis8Backup/src/data/${filename}`, JSON.stringify(data, null, 2));
    console.log(`Saved ${filename}`);
}

saveJSON('articleMatchQuestions.json', en.articleMatch.pairs);
saveJSON('sortQuestions.json', en.constitutionalSort.items);
saveJSON('crossroadsQuestions.json', en.constitutionalCrossroads.scenarios);
saveJSON('justiceJuryQuestions.json', en.justiceJury.cases);
if (en.reverseHangman) saveJSON('hangmanQuestions.json', en.reverseHangman);
