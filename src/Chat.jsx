import { useState, useRef, useEffect } from "react";
import "./Chat.css";
import { useLanguage } from "./context/LanguageContext";
import config from "./config";
import ReactMarkdown from "react-markdown";
import { Bot } from "lucide-react"

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
      
      if (userMsg.content.includes("this web") || userMsg.content.includes("this website") || userMsg.content.includes("this site")) {
        const aiMsg = {
          role: "assistant",
          content: "🌐 About your website – Gamified Learning \n \n Your website is a gamified learning platform about the Indian Constitution. It is mainly designed to make learning Constitution + Institutions (Legislature, Executive, Judiciary) fun and interactive instead of boring theory. \n \n 🎯 Main Purpose \n \n•	Spread constitutional literacy\n\n•	Teach users about Indian democratic institutions\n\n•	Convert boring civics into game-style learning\n\n•	Improve engagement using interactive features\n\n•	Gamification means adding points, levels, challenges, rewards, quizzes, and progress tracking to increase motivation and engagement in learning. \n\n🧩 What your website likely includes\n\n(Based on your project + typical gamified learning platforms)\n\n•	🎮 Dice / game-style navigation\n\n•	❓ Quiz & questions about Constitution\n\n•	🧠 Interactive learning modules\n\n•	📊 Progress / score tracking\n\n•	🏛️ Topics like:\n\n•	Legislature\n\n•	Executive\n\n•	Judiciary\n\n•	Constitutional basics\n\n👨‍🎓 Target Users\n\n•	Students\n\n•	Competitive exam learners\n\n•	Citizens who want to understand Constitution\n\n•	Educational / academic projects\n\n🚀 Overall Idea\n\nYour website is an educational gamified civic learning tool that tries to:\n\n•	Make learning fun 🎮\n\n•	Improve memory & engagement 🧠\n\n•	Teach real civic knowledge 📚\n\nThis type of gamified learning is known to increase motivation and participation compared to traditional learning.",
        };
        setMessages((prev) => [...prev, aiMsg]);
        return;
      } else {
        const res = await fetch(`${config.API_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ message: userMsg.content }),
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
      }
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