import { useEffect, useRef } from "react";

// Persistent Cache: Load from localStorage if available
const CACHE_KEY = "SS_TRANSLATION_CACHE";
const cache = (() => {
  try {
    const saved = localStorage.getItem(CACHE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
})();

const saveCache = () => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("Failed to save translation cache:", e);
  }
};

// Global Request Queue
const queue = [];
let activeRequests = 0;
const MAX_CONCURRENT = 3; // Allow up to 3 parallel requests for speed
const REQUEST_DELAY = 300; // 300ms delay for faster processing

const processQueue = async () => {
  if (activeRequests >= MAX_CONCURRENT || queue.length === 0) return;

  activeRequests++;
  const { text, lang, resolve, reject } = queue.shift();
  const cacheKey = `${lang}::${text.trim()}`;

  if (cache[cacheKey]) {
    resolve(cache[cacheKey]);
    activeRequests--;
    processQueue();
    return;
  }

  try {
    // Artificial delay to prevent burst blocks
    await new Promise(r => setTimeout(r, REQUEST_DELAY));

    const email = "samvidhan-siksha-app@translated.net";
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=en|${lang}&de=${email}`;
    const res = await fetch(url);

    if (res.status === 429) {
      console.error("MyMemory Rate Limit Hit (429). Stalling queue for 10s...");
      queue.unshift({ text, lang, resolve, reject });
      activeRequests--;
      await new Promise(r => setTimeout(r, 10000));
      processQueue();
      return;
    }

    if (!res.ok) throw new Error(`API Error: ${res.status}`);

    const data = await res.json();
    if (data.responseStatus !== 200) {
      throw new Error(data.responseDetails || "Unknown API error");
    }

    const translated = data.responseData?.translatedText || text;
    cache[cacheKey] = translated;
    saveCache();
    resolve(translated);
  } catch (error) {
    console.error("Translation Error:", error.message);
    resolve(text);
  } finally {
    activeRequests--;
    processQueue();
  }
};

const throttledTranslate = (text, lang) => {
  return new Promise((resolve, reject) => {
    queue.push({ text, lang, resolve, reject });
    // Try to start processing (multi-instance safety)
    for (let i = 0; i < MAX_CONCURRENT; i++) {
      processQueue();
    }
  });
};

const translatingSet = new Set();

async function translateElement(el, lang) {
  if (!el || !lang || lang === 'en') return;

  const original = el.getAttribute("data-original") || el.innerText.trim();
  if (!original) return;

  if (!el.getAttribute("data-original")) {
    el.setAttribute("data-original", original);
  }

  // Task ID includes the target language to handle lang switches mid-flight
  const taskId = `${el.id || ''}::${original}::${lang}`;
  if (translatingSet.has(taskId)) return;

  translatingSet.add(taskId);
  try {
    const translated = await throttledTranslate(original, lang);
    if (el.innerText !== translated) {
      el.innerText = translated;
    }
  } finally {
    translatingSet.delete(taskId);
  }
}

function restoreElement(el) {
  const original = el.getAttribute("data-original");
  if (original && el.innerText !== original) {
    el.innerText = original;
  }
}

export default function useTranslate(lang) {
  const langRef = useRef(lang);
  langRef.current = lang;

  useEffect(() => {
    const applyTranslation = () => {
      const all = document.querySelectorAll("[data-translate]");
      if (lang === "en") {
        all.forEach(restoreElement);
      } else {
        all.forEach((el) => translateElement(el, lang));
      }
    };

    applyTranslation();

    if (lang === "en") return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.hasAttribute?.("data-translate")) {
                translateElement(node, langRef.current);
              }
              node.querySelectorAll?.("[data-translate]").forEach((el) => {
                translateElement(el, langRef.current);
              });
            }
          });
        }
        else if (mutation.type === "attributes" && mutation.attributeName === "data-original") {
          translateElement(mutation.target, langRef.current);
        }
        else if (mutation.type === "characterData") {
          const parent = mutation.target.parentElement;
          if (parent && parent.closest?.("[data-translate]")) {
            translateElement(parent.closest("[data-translate]"), langRef.current);
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-original"],
      characterData: true
    });

    return () => observer.disconnect();
  }, [lang]);
}
