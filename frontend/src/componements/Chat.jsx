import React, { useState, useEffect } from 'react';
import { getConversationsList, getConversation, sendMessage, aiChat } from '../api';
import AIChat from './AIChat';
import PrivateMessages from './PrivateMessages';

const Chat = ({ user }) => {
  const [activeTab, setActiveTab] = useState('private'); // 'private' or 'ai'
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (activeTab === 'private') {
      getConversationsList(user.id).then(res => setConversations(res.data));
    }
  }, [activeTab, user.id]);

  const loadConversation = async (otherUserId) => {
    const res = await getConversation(user.id, otherUserId);
    setMessages(res.data);
    setSelectedChat(otherUserId);
  };

  const sendPrivateMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    const res = await sendMessage(user.id, selectedChat, newMessage);
    setMessages([...messages, res.data]);
    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-tabs">
        <button className={activeTab === 'private' ? 'active' : ''} onClick={() => setActiveTab('private')}>Messages privés</button>
        <button className={activeTab === 'ai' ? 'active' : ''} onClick={() => setActiveTab('ai')}>IA certifiée</button>
      </div>
      {activeTab === 'private' ? (
        <PrivateMessages
          user={user}
          conversations={conversations}
          selectedChat={selectedChat}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          loadConversation={loadConversation}
          sendPrivateMessage={sendPrivateMessage}
        />
      ) : (
        <AIChat user={user} />
      )}
    </div>
  );
};

export default Chat;