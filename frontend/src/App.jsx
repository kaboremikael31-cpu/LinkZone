import React, { useState, useEffect } from 'react';
import { initUser } from './api';
import NavBar from './components/NavBar';
import Feed from './components/Feed';
import CreatePost from './components/CreatePost';
import Profile from './components/Profile';
import Chat from './components/Chat';
import Search from './components/Search';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('feed');
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      // Fetch user info
      import('./api').then(({ getUserProfile }) => {
        getUserProfile(storedId).then(res => setUser(res.data));
      });
    } else {
      // Auto-create user
      initUser().then(u => setUser(u));
    }
  }, []);

  if (!user) return <div className="loading">Chargement...</div>;

  const renderView = () => {
    switch (currentView) {
      case 'feed':
        return <Feed user={user} onOpenProfile={(id) => { setSelectedUserId(id); setCurrentView('profile'); }} />;
      case 'create':
        return <CreatePost user={user} onPostCreated={() => setCurrentView('feed')} />;
      case 'profile':
        return <Profile userId={selectedUserId || user.id} currentUser={user} onBack={() => setCurrentView('feed')} />;
      case 'chat':
        return <Chat user={user} />;
      case 'search':
        return <Search user={user} onOpenProfile={(id) => { setSelectedUserId(id); setCurrentView('profile'); }} />;
      default:
        return <Feed user={user} onOpenProfile={(id) => { setSelectedUserId(id); setCurrentView('profile'); }} />;
    }
  };

  return (
    <div className="app">
      <NavBar currentView={currentView} setCurrentView={setCurrentView} user={user} />
      <main className="main-content">
        {renderView()}
      </main>
      <footer className="footer">
        <a href="https://t.me/modsTechsupport" target="_blank" rel="noopener noreferrer">Support Telegram</a>
        <a href="#" onClick={() => alert('Règles : Pas de spam, pas de contenu illégal...')}>Règles d'utilisation</a>
        <a href="#" onClick={() => alert('Contactez-nous sur Telegram pour de l\'aide.')}>Besoin d'aide</a>
      </footer>
    </div>
  );
}

export default App;