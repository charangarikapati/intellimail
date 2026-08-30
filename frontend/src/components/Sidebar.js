import React from 'react';
import { Inbox, Star, Send, Archive, Trash2, Plus, ShieldCheck, Clock } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, activeCategory, setActiveCategory, onOpenCompose, emails = [], isMobileOpen = false, onCloseMobile }) => {
  const inboxCount = emails.filter(m => !m.isDeleted && !m.isArchived && !m.isSnoozed).length;
  const starredCount = emails.filter(m => !m.isDeleted && m.isStarred && !m.isSnoozed).length;
  const snoozedCount = emails.filter(m => !m.isDeleted && m.isSnoozed).length;
  const archiveCount = emails.filter(m => !m.isDeleted && m.isArchived).length;
  const trashCount = emails.filter(m => m.isDeleted).length;

  const mainNav = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: inboxCount },
    { id: 'starred', label: 'Starred', icon: Star, count: starredCount },
    { id: 'snoozed', label: 'Snoozed', icon: Clock, count: snoozedCount },
    { id: 'sent', label: 'Sent', icon: Send, count: 0 },
    { id: 'archive', label: 'Archive', icon: Archive, count: archiveCount },
    { id: 'trash', label: 'Trash', icon: Trash2, count: trashCount }
  ];

  const categories = [
    { id: 'all', label: 'All Mail', color: '#94a3b8' },
    { id: 'internship', label: 'Internship', color: '#e11d48' },
    { id: 'academic', label: 'Academic', color: '#4f46e5' },
    { id: 'finance', label: 'Finance', color: '#059669' },
    { id: 'important', label: 'Important', color: '#d97706' }
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={`sidebar-container ${isMobileOpen ? 'mobile-open' : ''}`}
      style={{
        width: '220px',
        height: 'calc(100vh - 56px)',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        padding: '16px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        flexShrink: 0,
        transition: 'background-color 0.2s ease'
      }}
    >
      {/* Compose Button */}
      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '9px' }} onClick={onOpenCompose}>
        <Plus size={16} />
        <span>Compose</span>
      </button>

      {/* Main Mailbox Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-dim)', paddingLeft: '8px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Mailbox
        </span>
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.84rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.1s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={16} color={isActive ? 'var(--primary)' : 'var(--text-dim)'} />
                <span>{item.label}</span>
              </div>
              {item.count > 0 && (
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: isActive ? 'var(--primary)' : 'var(--border-subtle)',
                  color: isActive ? '#fff' : 'var(--text-muted)'
                }}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-dim)', paddingLeft: '8px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          AI Tags
        </span>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.82rem',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: cat.color }} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div style={{ marginTop: 'auto', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="var(--status-low)" />
          <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-muted)' }}>Gmail + Firestore Gateway</span>
        </div>
      </div>
    </aside>
  );
};
