import React, { useState } from 'react';
import { Star, RefreshCw, MoreVertical, Archive, Trash2, Mail, Clock, Inbox, Tag, Users, Info, CheckSquare, Square } from 'lucide-react';

export const EmailList = ({ emails, selectedEmail, onSelectEmail, onToggleStar, onArchive, onDelete, onMarkRead, onSnooze, loading }) => {
  const [activeTab, setActiveTab] = useState('primary');
  const [selectAll, setSelectAll] = useState(false);

  if (loading) {
    return (
      <div className="gmail-container-card" style={{ flex: 1, padding: '40px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        <RefreshCw size={24} className="animate-spin" style={{ marginBottom: '12px', color: 'var(--primary)' }} />
        <div>Loading messages...</div>
      </div>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <div className="gmail-container-card" style={{ flex: 1, padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Inbox size={48} color="var(--primary)" style={{ marginBottom: '16px', opacity: 0.6 }} />
        <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '500', marginBottom: '6px' }}>Your inbox is empty</h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-dim)' }}>Enjoy your clear mailbox!</p>
      </div>
    );
  }

  const filteredEmails = emails.filter((email) => {
    if (activeTab === 'promotions') return email.category === 'Finance' || email.category === 'Promotions';
    if (activeTab === 'social') return email.category === 'Social';
    if (activeTab === 'updates') return email.category === 'Academic' || email.category === 'Updates';
    return true; // Primary
  });

  return (
    <div className="gmail-container-card" style={{ flex: '1', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* Gmail Inbox Action Toolbar */}
      <div style={{
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-panel)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setSelectAll(!selectAll)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}
            title="Select all"
          >
            {selectAll ? <CheckSquare size={18} color="var(--primary)" /> : <Square size={18} />}
          </button>

          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}
            title="Refresh"
          >
            <RefreshCw size={17} />
          </button>

          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}
            title="More"
          >
            <MoreVertical size={17} />
          </button>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '500' }}>
          1–{filteredEmails.length} of {emails.length}
        </div>
      </div>

      {/* Gmail Category Tabs (Primary, Promotions, Social, Updates) */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-panel)'
      }}>
        {[
          { id: 'primary', label: 'Primary', icon: Inbox, color: '#0b57d0' },
          { id: 'promotions', label: 'Promotions', icon: Tag, color: '#188038' },
          { id: 'social', label: 'Social', icon: Users, color: '#1a73e8' },
          { id: 'updates', label: 'Updates', icon: Info, color: '#e37400' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                border: 'none',
                borderBottom: isActive ? `3px solid ${tab.color}` : '3px solid transparent',
                background: 'transparent',
                color: isActive ? tab.color : 'var(--text-muted)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-gmail)',
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
              <Icon size={18} color={isActive ? tab.color : 'var(--text-muted)'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Email Message Rows List */}
      <div style={{ flex: '1', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {filteredEmails.map((email) => {
          const isSelected = selectedEmail?.id === email.id;
          return (
            <div
              key={email.id}
              className="gmail-email-row"
              onClick={() => onSelectEmail(email)}
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                background: isSelected
                  ? 'var(--primary-light)'
                  : email.isRead
                  ? 'var(--bg-panel)'
                  : 'var(--bg-card-hover)',
                cursor: 'pointer',
                transition: 'background 0.1s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              {/* Checkbox */}
              <button
                onClick={(e) => e.stopPropagation()}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}
              >
                <Square size={17} />
              </button>

              {/* Star Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(email.id);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                <Star
                  size={18}
                  color={email.isStarred ? '#f59e0b' : 'var(--text-dim)'}
                  fill={email.isStarred ? '#f59e0b' : 'none'}
                />
              </button>

              {/* Sender Name */}
              <div style={{
                width: '180px',
                minWidth: '140px',
                fontWeight: email.isRead ? '500' : '700',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-gmail)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {email.sender.split('<')[0]}
              </div>

              {/* Subject & Snippet Inline */}
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'baseline',
                gap: '6px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                <span style={{
                  fontWeight: email.isRead ? '500' : '700',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-gmail)'
                }}>
                  {email.subject}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  — {email.snippet}
                </span>
              </div>

              {/* Priority Badge */}
              {email.priority === 'High' && (
                <span className="badge badge-high" style={{ flexShrink: 0 }}>High</span>
              )}
              {email.priority === 'Medium' && (
                <span className="badge badge-medium" style={{ flexShrink: 0 }}>Med</span>
              )}

              {/* Date */}
              <div style={{
                fontSize: '0.78rem',
                fontWeight: email.isRead ? '400' : '700',
                color: 'var(--text-dim)',
                flexShrink: 0,
                width: '70px',
                textAlign: 'right'
              }}>
                {email.date}
              </div>

              {/* Quick Hover Actions Bar */}
              <div className="row-hover-actions">
                <button
                  onClick={(e) => { e.stopPropagation(); if (onArchive) onArchive(email.id); }}
                  style={{ background: 'none', border: 'none', padding: '6px', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  title="Archive"
                >
                  <Archive size={16} />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); if (onDelete) onDelete(email.id); }}
                  style={{ background: 'none', border: 'none', padding: '6px', borderRadius: '50%', cursor: 'pointer', color: 'var(--status-high)' }}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); if (onMarkRead) onMarkRead(email.id, !email.isRead); }}
                  style={{ background: 'none', border: 'none', padding: '6px', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  title={email.isRead ? "Mark as unread" : "Mark as read"}
                >
                  <Mail size={16} />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); if (onSnooze) onSnooze(email.id, 'Tomorrow 9:00 AM'); }}
                  style={{ background: 'none', border: 'none', padding: '6px', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  title="Snooze"
                >
                  <Clock size={16} />
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
