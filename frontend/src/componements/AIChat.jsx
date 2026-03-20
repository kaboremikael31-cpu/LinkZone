import React, { useState } from 'react';
import { aiChat } from '../api';

const AIChat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input, sender: 'user' };
    setMessages([...messages, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await aiChat(input);
      const aiMsg = { role: 'ai', content: res.data.reply, sender: 'ai', certified: true };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Erreur de l\'IA', sender: 'ai' }]);
    }
    setLoading(false);
  };

  return (
    <div className="ai-chat">
      <div className="ai-header">
        <img src="/ai-avatar.png" alt="AI" className="ai-avatar" />
        <span>Assistant IA</span>
        <span className="badge">✓ Certifié</span>
      </div>
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <strong>{msg.sender === 'user' ? 'Vous' : 'IA'}</strong>
            <p>{msg.content}</p>
          </div>
        ))}
        {loading && <div className="loading">L'IA réfléchit...</div>}
      </div>
      <div className="message-input">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Posez votre question..." />
        <button onClick={sendMessage}>Envoyer</button>
      </div>
    </div>
  );
};

export default AIChat;