import React, { useState } from 'react';
import './css/Chatbot.css';
const API = process.env.REACT_APP_BACKEND_URL;


const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setOpen(!open);

  const sendQuestion = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.text }),
      });

      const data = await response.json();

      let botText = "";

      if (data.status === "success") {

        botText += `Chapter: ${data.routed_chapter || "Unknown"}\n\n`;

        if (data.given) {
          botText += ` Given:\n${data.given}\n\n`;
        }

        if (data.to_find) {
          botText += `To Find:\n${data.to_find}\n\n`;
        }

        if (data.solution && data.solution.length > 0) {
          botText += ` Steps:\n`;
          data.solution.forEach((step, index) => {
            botText += `${index + 1}. ${step}\n`;
          });
          botText += `\n`;
        }

        if (data.final_answer) {
          botText += ` Final Answer:\n${data.final_answer}`;
        }

      } else {

        botText = `${data.answer || "Unable to solve this question."}`;

      }

      const botMessage = {
        sender: 'bot',
        text: botText
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Error contacting server.' },
      ]);
    }

    setLoading(false);
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendQuestion();
  };

  return (
    <>
      {/* Chatbot icon */}
      <div className="chatbot-container" onClick={toggleChat}>
        <div className="chatbot-icon">
          💬
        </div>
      </div>

      {/* Popup */}
      {open && (
        <div className="chatbot-popup">
          <div className="chatbot-header">
            Chatbot
            <span onClick={toggleChat}>✖</span>
          </div>

          <div className="chatbot-messages">
            <div className="bot-message">
              Ask me a question (please just a question)
            </div>

            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.sender === 'user' ? 'user-message' : 'bot-message'}
              >
                {msg.text}
              </div>
            ))}

            {loading && <div className="bot-message">Thinking...</div>}
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button onClick={sendQuestion}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
