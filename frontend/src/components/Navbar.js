import React, { useState } from 'react';
import { Search, Sparkles, Settings, Sun, Moon, Mail, Keyboard, LogOut, ChevronDown, RefreshCw, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onSearch, onOpenBriefing, onOpenSettings, onOpenShortcuts, onRefresh, onToggleSidebar }) => {
  const [query, setQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isDemoMode, theme, toggleTheme, logout } = useAuth();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
  };

  return (
    <header style={{
      height: '56px',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--bg-header)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'background-color 0.2s ease, border-color 0.2s ease'
    }}>
      {/* Brand Logo & Mobile Menu Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onToggleSidebar}
          className="btn-secondary"
          style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Toggle Navigation"
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Mail size={16} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
              IntelliMail
            </span>
            <span className="navbar-actions-text" style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '600' }}>
              AI Enterprise
            </span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} style={{ flex: '1', maxWidth: '560px', position: 'relative' }}>
        <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search mailbox or ask AI (e.g., 'internship deadline', 'from:professor')..."
          style={{
            width: '100%',
            padding: '8px 14px 8px 38px',
            borderRadius: '6px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
            fontSize: '0.84rem',
            outline: 'none',
            transition: 'border-color 0.15s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
        />
      </form>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Status Badge */}
        <div style={{
          padding: '4px 8px',
          borderRadius: '4px',
          background: isDemoMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          border: isDemoMode ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
          color: isDemoMode ? 'var(--status-medium)' : 'var(--status-low)',
          fontSize: '0.72rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isDemoMode ? 'var(--status-medium)' : 'var(--status-low)' }} />
          {isDemoMode ? 'Demo Mode' : 'Gmail Live Sync'}
        </div>

        {/* Live Sync / Refresh Button */}
        <button
          className="btn-secondary"
          style={{ padding: '6px 10px' }}
          onClick={onRefresh}
          title="Synchronize Live Gmail Inbox"
        >
          <RefreshCw size={14} />
          <span style={{ fontSize: '0.78rem' }}>Sync</span>
        </button>

        {/* AI Briefing Button */}
        <button className="btn-ai-pill" onClick={onOpenBriefing}>
          <Sparkles size={14} color="var(--primary)" />
          <span>AI Briefing</span>
        </button>

        {/* Keyboard Shortcuts Cheatsheet Button */}
        <button
          className="btn-secondary"
          style={{ padding: '6px 10px' }}
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts (?)"
        >
          <Keyboard size={15} />
        </button>

        {/* Dark / Light Theme Toggle Button */}
        <button
          className="btn-secondary"
          style={{ padding: '6px 10px' }}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={15} color="#d97706" /> : <Moon size={15} color="#4f46e5" />}
        </button>

        {/* Settings Button */}
        <button className="btn-secondary" style={{ padding: '6px 10px' }} onClick={onOpenSettings} title="Settings">
          <Settings size={15} />
        </button>

        {/* User Profile & Sign Out Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              background: isProfileOpen ? 'var(--primary-light)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-main)'
            }}
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>{user?.name?.split(' ')[0] || 'Account'}</span>
            <ChevronDown size={13} color="var(--text-muted)" />
          </button>

          {isProfileOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              width: '220px',
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-modal)',
              zIndex: 200,
              overflow: 'hidden'
            }} className="animate-fade-in">
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)' }}>{user?.name || 'User'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'user@gmail.com'}</div>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '9px 12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--status-high)',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <LogOut size={14} />
                <span>Sign Out / Switch Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
