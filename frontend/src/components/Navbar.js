import React, { useState } from 'react';
import { Search, Sparkles, Settings, Sun, Moon, Keyboard, LogOut, ChevronDown, RefreshCw, Menu, SlidersHorizontal, HelpCircle, Grid } from 'lucide-react';
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
      height: '64px',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--bg-header)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'background-color 0.2s ease'
    }}>
      {/* Brand Logo & Mobile Menu Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          title="Main menu"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          {/* Authentic Gmail Multi-Color / Red M Envelope Icon */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M1.5 5.25L12 12.75L22.5 5.25" stroke="#EA4335" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="2" y="4" width="20" height="16" rx="3" stroke="#4285F4" strokeWidth="2"/>
            <path d="M2 18L8.5 13" stroke="#FBBC05" strokeWidth="2" strokeLinecap="round"/>
            <path d="M22 18L15.5 13" stroke="#34A853" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: '500', color: 'var(--text-main)', letterSpacing: '-0.4px', fontFamily: 'var(--font-gmail)' }}>
              Gmail
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.2px' }}>
              IntelliMail AI
            </span>
          </div>
        </div>
      </div>

      {/* Gmail Search Pill Bar */}
      <form onSubmit={handleSearchSubmit} style={{ flex: '1', maxWidth: '720px', margin: '0 16px', position: 'relative' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-input)',
          borderRadius: '28px',
          padding: '0 16px',
          height: '46px',
          transition: 'all 0.15s ease',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)'
        }}
        onFocus={(e) => e.currentTarget.style.background = 'var(--bg-input-focus)'}
        >
          <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-dim)', paddingRight: '12px' }}>
            <Search size={18} />
          </button>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search mail or ask Gemini (e.g. 'interview status', 'from:professor')"
            style={{
              flex: '1',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '0.92rem',
              fontFamily: 'var(--font-gmail)',
              outline: 'none'
            }}
          />

          <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-dim)', paddingLeft: '8px' }} title="Search options">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </form>

      {/* Gmail Right Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Sync Status Badge */}
        <div style={{
          padding: '4px 10px',
          borderRadius: '16px',
          background: isDemoMode ? 'rgba(217, 119, 6, 0.12)' : 'rgba(20, 108, 46, 0.12)',
          color: isDemoMode ? 'var(--status-medium)' : 'var(--status-low)',
          fontSize: '0.74rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isDemoMode ? 'var(--status-medium)' : 'var(--status-low)' }} />
          {isDemoMode ? 'Demo Mode' : 'Live Sync'}
        </div>

        {/* Sync Button */}
        <button
          onClick={onRefresh}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          title="Sync Inbox"
        >
          <RefreshCw size={18} />
        </button>

        {/* AI Briefing Pill */}
        <button className="btn-ai-pill" onClick={onOpenBriefing} style={{ margin: '0 4px' }}>
          <Sparkles size={14} color="var(--primary)" />
          <span>Gemini Briefing</span>
        </button>

        {/* Help Icon */}
        <button
          onClick={onOpenShortcuts}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          title="Support & Keyboard Shortcuts (?)"
        >
          <HelpCircle size={20} />
        </button>

        {/* Settings Icon */}
        <button
          onClick={onOpenSettings}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          title="Settings"
        >
          <Settings size={20} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          title={theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
        >
          {theme === 'dark' ? <Sun size={20} color="#fcd34d" /> : <Moon size={20} color="#0b57d0" />}
        </button>

        {/* Google Apps 9-Dot Grid Icon */}
        <button
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          title="Google apps"
        >
          <Grid size={20} />
        </button>

        {/* User Profile Avatar Dropdown */}
        <div style={{ position: 'relative', marginLeft: '4px' }}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '50%',
              display: 'flex'
            }}
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
            />
          </button>

          {isProfileOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              width: '240px',
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-modal)',
              zIndex: 200,
              overflow: 'hidden'
            }} className="animate-fade-in">
              <div style={{ padding: '14px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={user?.name || 'User'}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', marginBottom: '6px' }}
                />
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>{user?.name || 'User'}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{user?.email || 'user@gmail.com'}</div>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--status-high)',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(179, 38, 30, 0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <LogOut size={16} />
                <span>Sign Out of Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
