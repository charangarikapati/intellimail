import React from 'react';
import { Inbox, Star, Send, Archive, Trash2, Edit3, Clock, AlertOctagon, FileText, Mail, HardDrive } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, activeCategory, setActiveCategory, onOpenCompose, emails = [], isMobileOpen = false, onCloseMobile }) => {
  const inboxCount = emails.filter(m => !m.isDeleted && !m.isArchived && !m.isSnoozed && !m.isSent).length;
  const starredCount = emails.filter(m => !m.isDeleted && m.isStarred && !m.isSnoozed).length;
  const snoozedCount = emails.filter(m => !m.isDeleted && m.isSnoozed).length;
  const sentCount = emails.filter(m => !m.isDeleted && m.isSent).length;
  const archiveCount = emails.filter(m => !m.isDeleted && m.isArchived).length;
  const trashCount = emails.filter(m => m.isDeleted).length;

  const mainNav = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: inboxCount },
    { id: 'starred', label: 'Starred', icon: Star, count: starredCount },
    { id: 'snoozed', label: 'Snoozed', icon: Clock, count: snoozedCount },
    { id: 'sent', label: 'Sent', icon: Send, count: sentCount },
    { id: 'archive', label: 'Archive', icon: Archive, count: archiveCount },
    { id: 'trash', label: 'Trash', icon: Trash2, count: trashCount }
  ];

  const categories = [
    { id: 'all', label: 'All Mail', color: '#94a3b8' },
    { id: 'internship', label: 'Internship', color: '#ea4335' },
    { id: 'academic', label: 'Academic', color: '#4285f4' },
    { id: 'finance', label: 'Finance', color: '#34a853' },
    { id: 'important', label: 'Important', color: '#fbbc05' }
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
        width: '240px',
        height: 'calc(100vh - 64px)',
        background: 'var(--bg-sidebar)',
        padding: '8px 16px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        flexShrink: 0,
        transition: 'background-color 0.2s ease'
      }}
    >
      {/* Authentic Gmail Floating Compose Pill Button */}
      <div style={{ padding: '8px 0' }}>
        <button className="gmail-compose-btn" onClick={onOpenCompose}>
          {/* Multi-Colored / Crisp Pencil Icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="#4285F4"/>
            <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#EA4335"/>
          </svg>
          <span>Compose</span>
        </button>
      </div>

      {/* Main Mailbox Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
                padding: '0 16px 0 24px',
                height: '32px',
                borderRadius: '16px',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary-text)' : 'var(--text-secondary)',
                fontWeight: isActive ? '700' : '400',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-gmail)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--bg-card-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Icon size={18} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </div>
              {item.count > 0 && (
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  color: isActive ? 'var(--primary-text)' : 'var(--text-muted)'
                }}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* AI Categories & Labels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '8px' }}>
        <span style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-dim)', paddingLeft: '24px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Categories
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
                gap: '16px',
                padding: '0 16px 0 24px',
                height: '32px',
                borderRadius: '16px',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary-text)' : 'var(--text-muted)',
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--bg-card-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color }} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Storage Indicator Bar at Bottom */}
      <div style={{ marginTop: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.74rem' }}>
          <HardDrive size={14} />
          <span>1.2 GB of 15 GB used</span>
        </div>
        <div style={{ width: '100%', height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: '8%', height: '100%', background: 'var(--primary)' }} />
        </div>
      </div>
    </aside>
  );
};
