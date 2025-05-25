import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css";

const Chatbot = () => {
  // ===== STATE =======================================================
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "היי! איך אפשר לעזור?" },
  ]);
  const [input, setInput] = useState("");

  // ===== CONSTANT BOT REPLY =========================================
  const BOT_REPLY = "זו תגובת הבוט הקבועה 🤖";

  // ===== REFS & EFFECTS =============================================
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ===== HANDLERS ====================================================
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // מוסיפים את הודעת המשתמש + תגובת הבוט הקבועה
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: trimmed },
      { id: Date.now() + 1, sender: "bot", text: BOT_REPLY },
    ]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // ===== RENDER ======================================================
  return (
    <div className="chat-wrapper">
      <header className="chat-header">
        <div className="avatar" />
        <div className="title-wrap">
          <h2 className="title">Name</h2>
          <span className="subtitle">Last name</span>
        </div>
      </header>

      <div className="messages">
        {messages.map(({ id, sender, text }) => (
          <div
            key={id}
            className={`bubble ${sender === "user" ? "outgoing" : "incoming"}`}
          >
            {text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="input-bar">
        <textarea
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          aria-label="Send message"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
