import React from 'react';
import { Star, Paperclip, CheckCircle2 } from 'lucide-react';

export const EmailList = ({ emails, selectedEmail, onSelectEmail, onToggleStar, loading }) => {
  if (loading) {
    return (
      <div style={{ flex: 1, padding: '30px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
        Fetching mailbox messages...
      </div>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <div style={{ flex: 1, padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <CheckCircle2 size={36} color="var(--status-low)" style={{ marginBottom: '12px', opacity: 0.8 }} />
        <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>Inbox Zero</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>All clear in this view.</p>
      </div>
    );
  }

  return (
    <div style={{ flex: '1', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {emails.map((email) => {
        const isSelected = selectedEmail?.id === email.id;
        return (
          <div
            key={email.id}
            onClick={() => onSelectEmail(email)}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-subtle)',
              background: isSelected
                ? 'var(--primary-light)'
                : email.isRead
                ? 'transparent'
                : 'var(--bg-card-hover)',
              borderLeft: isSelected
                ? '3px solid var(--primary)'
                : !email.isRead
                ? '3px solid var(--status-info)'
                : '3px solid transparent',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            {/* Header: Sender + Badges + Date */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(email.id);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                >
                  <Star
                    size={15}
                    color={email.isStarred ? '#f59e0b' : 'var(--text-dim)'}
                    fill={email.isStarred ? '#f59e0b' : 'none'}
                  />
                </button>
                <span style={{ fontWeight: email.isRead ? '500' : '700', color: 'var(--text-main)', fontSize: '0.86rem' }}>
                  {email.sender.split('<')[0]}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {email.priority === 'High' && (
                  <span className="badge badge-high">High</span>
                )}
                {email.priority === 'Medium' && (
                  <span className="badge badge-medium">Med</span>
                )}
                <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{email.date}</span>
              </div>
            </div>

            {/* Subject */}
            <div style={{
              fontWeight: email.isRead ? '500' : '700',
              fontSize: '0.85rem',
              color: 'var(--text-main)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {email.subject}
            </div>

            {/* Snippet */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <p style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '92%'
              }}>
                {email.snippet}
              </p>
              {email.hasAttachments && (
                <Paperclip size={13} color="var(--text-dim)" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
