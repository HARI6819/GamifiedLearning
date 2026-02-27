import { useState, useRef, useEffect } from "react";
import "./Chat.css";
import { useLanguage } from "./context/LanguageContext";
import config from "./config";
import ReactMarkdown from "react-markdown";
import { Bot } from "lucide-react";

const SYSTEM_PROMPT = `You are a helpful AI assistant embedded inside a gamified learning platform called "Samvidhan Siksha" (Constitutional Learning). Here is everything you know about this website:

## About the Website
- **Name**: Samvidhan Siksha – A Gamified Learning Platform
- **Purpose**: To make learning about the Indian Constitution fun, interactive, and engaging through gamification instead of boring textbook study.
- **Target Users**: Students, competitive exam aspirants (UPSC, SSC, etc.), and any citizen who wants to understand the Indian Constitution and democratic institutions.

## Core Theme
The platform covers three pillars of Indian democracy:
1. **Legislature** – Parliament, Lok Sabha, Rajya Sabha, lawmaking
2. **Executive** – President, Prime Minister, Council of Ministers
3. **Judiciary** – Supreme Court, High Courts, fundamental rights

## Games & Learning Modules
The platform features multiple interactive games:
- **Quiz** – Multiple-choice questions on the Constitution and civics topics
- **Chakra of Knowledge** – Spin-the-wheel style quiz game
- **Constitutional Crossroads** – Scenario-based decision-making game
- **Constitutional Sort** – Drag-and-drop sorting of constitutional concepts
- **Article Match** – Match constitutional articles to their descriptions
- **Justice Jury** – Court-room style game about the judiciary
- **Rights & Duties Climb** – Snakes & Ladders style game on fundamental rights and duties
- **Reverse Hangman** – Word guessing game with constitutional terms
- **Constitution Cards** – Flashcard-style learning game

## Key Features
- 🎮 Gamified learning with points, levels, and progress tracking
- 📊 Dashboard showing scores and game progress
- 🌐 Multi-language support
- 🌙 Dark/Light theme toggle
- 👤 User login and profile page
- 💬 AI Chat assistant (that's you!)
- 📚 Learn section with structured content
- 🏛️ Pillars section explaining Legislature, Executive, Judiciary

## Your Role
You are the website's AI assistant. Answer questions about the website, its games, the Indian Constitution, and civics topics clearly and helpfully. If asked about the website, give accurate details based on the above. For general questions, answer to the best of your knowledge.
`;

export default function Chat() {
  const { t } = useLanguage();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const shouldAutoScroll = useRef(true);

  /* ------------------ SMART SCROLL DETECTION ------------------ */
  useEffect(() => {
    const container = messagesContainerRef.current;

    const handleScroll = () => {
      if (!container) return;

      const threshold = 120; // px from bottom
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        threshold;

      shouldAutoScroll.current = isNearBottom;
    };

    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  /* ------------------ SCROLL TO BOTTOM ------------------ */
  const scrollToBottom = (force = false) => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (force || shouldAutoScroll.current) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  /* ------------------ SEND MESSAGE ------------------ */
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Force scroll when user sends message
    scrollToBottom(true);

    try {
      const res = await fetch(`${config.API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          message: userMsg.content,
          system_prompt: SYSTEM_PROMPT,
        }),
      });

      const data = await res.json();

      const aiMsg = {
        role: "assistant",
        content:
          data?.choices?.[0]?.message?.content ||
          data?.error?.message ||
          t.chat.noResponse,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t.chat.serverError },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-main">
        {/* ------------------ HEADER ------------------ */}
        <div className="chat-header">
          <h1>{t.chat.title}</h1>
        </div>

        {/* ------------------ MESSAGES ------------------ */}
        <div className="chat-messages" ref={messagesContainerRef}>
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="gpt-logo">
                <Bot size={45} />
              </div>
              <h2>How can I help you today?</h2>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`message-wrapper ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === "assistant" &&
                  <Bot size={25} />
                }
              </div>
              <div className="message-content">


                <div className="message-text">
                  {msg.role === "assistant" ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* ------------------ TYPING INDICATOR ------------------ */}
          {loading && (
            <div className="message-wrapper assistant">
              <div className="message-avatar">
                <Bot size={25} />
              </div>
              <div className="message-content">

                <div className="message-text typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ------------------ INPUT ------------------ */}
        <div className="chat-input-area">
          <div className="input-wrapper">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message ..."
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button onClick={sendMessage} disabled={!input.trim() || loading}>
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                height="1em"
                width="1em"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>

          <div className="disclaimer">
            AI can make mistakes. Consider checking important information.
          </div>
        </div>
      </div>
    </div>
  );
}