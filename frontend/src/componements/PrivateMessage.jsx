import React from 'react';

const PrivateMessages = ({ user, conversations, selectedChat, messages, newMessage, setNewMessage, loadConversation, sendPrivateMessage }) => {
  return (
    <div className="private-messages">
      <div className="conversations-list">
        {conversations.map(conv => (
          <div key={conv.user.id} className={`conversation-item ${selectedChat === conv.user.id ? 'active' : ''}`} onClick={() => loadConversation(conv.user.id)}>
            <img src={conv.user.avatar || '/default-avatar.png'} alt="avatar" />
            <div>
              <strong>{conv.user.username}</strong>
              <p>{conv.lastMessage?.content?.substring(0, 30)}</p>
            </div>
          </div>
        ))}
      </div>
      {selectedChat ? (
        <div className="chat-window">
          <div className="messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.sender_id === user.id ? 'sent' : 'received'}`}>
                <strong>{msg.sender_username}</strong>
                <p>{msg.content}</p>
              </div>
            ))}
          </div>
          <div className="message-input">
            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Votre message..." />
            <button onClick={sendPrivateMessage}>Envoyer</button>
          </div>
        </div>
      ) : (
        <div className="no-chat">Sélectionnez une conversation</div>
      )}
    </div>
  );
};

export default PrivateMessages;