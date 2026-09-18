import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: '◌' },
  { to: '/courses', label: 'Study materials', icon: '▤' },
  { to: '/mock-tests', label: 'Mock tests', icon: '▣' },
  { to: '/results', label: 'Results', icon: '↗' },
  { to: '/profile', label: 'Profile', icon: '○' }
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return <div className="app-shell">
    <aside className={`app-sidebar ${mobileOpen ? 'is-open' : ''}`}>
      <div className="sidebar-brand"><img src="/images/dream-education-logo-DnWAcGmn.png" alt="Dream Education Nepal" /><span>Dream Mock</span></div>
      <nav className="sidebar-nav" aria-label="Primary navigation">
        <p className="nav-label">Learning space</p>
        {navItems.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}><span className="nav-icon">{item.icon}</span>{item.label}</NavLink>)}
      </nav>
      <div className="sidebar-bottom"><div className="level-mini"><span>Assigned level</span><strong>{user.assignedLevel}</strong></div><button className="sidebar-logout" onClick={handleLogout}>Sign out <span>↗</span></button></div>
    </aside>
    {mobileOpen && <button className="sidebar-overlay" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <div className="app-main">
      <header className="app-header"><button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation">☰</button><div className="header-search"><span>⌕</span><input placeholder="Search courses, tests, or lessons" /></div><div className="header-actions"><button className="icon-button" aria-label="Notifications">♢<span className="notification-dot" /></button><button className="profile-chip" onClick={() => navigate('/profile')}><span className="avatar">{user.fullName?.slice(0, 1).toUpperCase()}</span><span className="profile-chip-name">{user.fullName}</span><span className="chevron">⌄</span></button></div></header>
      <main className="app-content"><Outlet /></main>
    </div>
  </div>;
}

