
import { useState } from "react";
import "./AIChatbot.css";

export default function AIChatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm the Maasin HealthLine AI assistant. What health information can I help you with today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(event) {
    event.preventDefault();

    const question = input.trim();
    if (!question || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", text: question },
    ]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://edp-3a45.onrender.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to get a response.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: data.reply || "Sorry, I could not generate a response.",
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: `Sorry, I couldn't connect to the AI assistant. ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  
return (
  <div className="ai-page">
    <div className="ai-page-banner">
        <div className="ai-banner-icon">🤖</div>
            <div>
                <h1>AI Health Assistant</h1>
                <p>
                   Ask general health questions and learn more about health center services.
                </p>
            </div>
        </div>

        <section className="ai-chatbot ai-chatbot-page">
            <header className="ai-chatbot-header">
                <div>
                    <h2>Maasin HealthLine AI</h2>
                    <p>Health information assistant</p>
                </div>
                <span className="ai-status">● Online</span>
            </header>

            <div className="ai-chatbot-messages" aria-live="polite">
            {messages.map((message, index) => (
                <div
                key={index}
                className={`ai-message ${message.role}`}
          >
                {message.text}
                </div>
            ))}

            {loading && (
            <div className="ai-message assistant">Thinking...</div>
            )}
        </div>

            <form className="ai-chatbot-form" onSubmit=           {sendMessage}>
            <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.       value)}
                placeholder="Ask a health question..."
                aria-label="Your health question"
                maxLength={2000}
                disabled={loading}
            />

            <button type="submit" disabled={loading || !input.  trim()}>
                {loading ? "Sending..." : "➤ Send"}
            </button>
            </form>

             <p className="ai-chatbot-disclaimer">
            AI responses provide general information, not a     diagnosis.
            For emergencies, seek immediate medical care.
            </p>
            </section>
        </div>
    );

}
