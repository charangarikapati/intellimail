import React from 'react';
import { X, Settings, Shield, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { preferences, setPreferences, isDemoMode, theme, setTheme } = useAuth();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }} className="animate-fade-in">
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        boxShadow: 'var(--shadow-modal)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>Application Preferences</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Theme Selector (Dark / Light) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600', marginBottom: '6px' }}>
              Interface Theme
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <button
                onClick={() => setTheme('dark')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: theme === 'dark' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: theme === 'dark' ? 'var(--primary-light)' : 'var(--bg-app)',
                  color: theme === 'dark' ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontWeight: theme === 'dark' ? '600' : '400',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Moon size={14} /> Dark Mode
              </button>

              <button
                onClick={() => setTheme('light')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: theme === 'light' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: theme === 'light' ? 'var(--primary-light)' : 'var(--bg-app)',
                  color: theme === 'light' ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontWeight: theme === 'light' ? '600' : '400',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Sun size={14} /> Light Mode
              </button>
            </div>
          </div>

          {/* Default Tone Setting */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600', marginBottom: '6px' }}>
              Default AI Draft Tone
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {['Professional', 'Friendly', 'Formal', 'Concise'].map((tone) => (
                <button
                  key={tone}
                  onClick={() => setPreferences({ ...preferences, defaultTone: tone })}
                  style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: preferences.defaultTone === tone ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: preferences.defaultTone === tone ? 'var(--primary-light)' : 'var(--bg-app)',
                    color: preferences.defaultTone === tone ? 'var(--primary)' : 'var(--text-muted)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    fontWeight: preferences.defaultTone === tone ? '600' : '400'
                  }}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* Account Status Box */}
          <div style={{ padding: '12px', borderRadius: '6px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Shield size={14} color="var(--status-low)" />
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main)' }}>Google OAuth & Privacy Policy</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>
              Current Mode: {isDemoMode ? 'Demo Mode' : 'Connected to Gmail Account'}. Passwords are never collected or stored.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button className="btn-primary" onClick={onClose}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
