import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

export const ShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'j', action: 'Next email in list' },
    { key: 'k', action: 'Previous email in list' },
    { key: 'c', action: 'Compose new email' },
    { key: 'r', action: 'Reply to selected email' },
    { key: 's', action: 'Star / unstar selected email' },
    { key: 'e', action: 'Archive selected email' },
    { key: '# / Del', action: 'Move selected email to Trash' },
    { key: 'b', action: 'Open AI Daily Briefing' },
    { key: '?', action: 'Open this shortcuts cheatsheet' },
    { key: 'Esc', action: 'Close open modal / dialog' }
  ];

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
    }} className="animate-fade-in" onClick={onClose}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        boxShadow: 'var(--shadow-modal)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Keyboard size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
              Keyboard Shortcuts Cheatsheet
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
          Navigate and manage your inbox with high efficiency without touching your mouse.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          maxHeight: '340px',
          overflowY: 'auto'
        }}>
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'var(--bg-app)',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: '500' }}>
                {sc.action}
              </span>
              <kbd style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.72rem',
                fontWeight: '700',
                color: 'var(--primary)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                fontFamily: 'monospace'
              }}>
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="btn-primary" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
