import React, { useState } from 'react';
import './Chatbot.css';

function Chatbot() {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hello! How can I help you today?' }]);

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const handleSendMessage = async (userMsg) => {
    addMessage("user", userMsg);
    // Call n8n webhook to get answer from MongoDB Atlas
    try {
      const response = await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await response.json();
      const botReply = data.reply || "Sorry, I could not fetch an answer.";
      addMessage("bot", botReply);
    } catch (err) {
      console.error('Chatbot fetch error:', err);
      addMessage("bot", "Error contacting AI service.");
    }
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle" onClick={() => setOpen(!open)}>
        {open ? 'Close' : 'Chat'}
      </button>
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">Chatbot</div>
          <div className="chatbot-body">
            {messages.map((msg, index) => (
              <p key={index} className={msg.sender}>{msg.text}</p>
            ))}
            <form className="chatbot-input" onSubmit={(e) => { e.preventDefault(); const input = e.target.elements.msg.value.trim(); if (input) { handleSendMessage(input); e.target.reset(); } }}>
              <input type="text" name="msg" placeholder="Ask something..." required />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
