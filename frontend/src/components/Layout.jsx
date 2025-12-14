import React from 'react';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const username = localStorage.getItem('cork_username');

  const logout = () => {
    localStorage.removeItem('cork_token');
    localStorage.removeItem('cork_username');
    navigate('/login');
  };

  return (
    <div className="app-root">
      <header className="app-header">
        {/* Centered Title */}
        <div className="app-header-center">
          <span className="app-title">NotesBoard</span>
        </div>

        {/* Right side: Hi, admin + Logout */}
        <div className="app-header-right">
          {username && <span className="app-user">Hi, {username}</span>}
          <button className="app-logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="app-main">
        {children}
      </main>
    </div>
  );
};

export default Layout;
