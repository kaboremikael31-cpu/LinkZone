import React from 'react';

const NavBar = ({ currentView, setCurrentView, user }) => {
  const navItems = [
    { id: 'feed', label: 'Accueil', icon: '🏠' },
    { id: 'search', label: 'Recherche', icon: '🔍' },
    { id: 'create', label: '+', icon: '+' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'profile', label: 'Profil', icon: '👤' },
  ];

  return (
    <nav className="navbar">
      {navItems.map(item => (
        <button
          key={item.id}
          className={`nav-btn ${currentView === item.id ? 'active' : ''}`}
          onClick={() => setCurrentView(item.id)}
        >
          {item.id === 'profile' ? (
            <img src={user.avatar || '/default-avatar.png'} alt="avatar" className="nav-avatar" />
          ) : (
            <span>{item.icon}</span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default NavBar;