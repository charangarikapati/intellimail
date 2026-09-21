import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, Wand2, Scissors, Maximize2, Briefcase, Smile, Undo2, ChevronDown, Paperclip, Link2, Image, Lock, Trash2, Minus, Maximize, ChevronUp } from 'lucide-react';
import { api } from '../services/api';

export const ComposeModal = ({ isOpen, onClose, onEmailSent, initialDraft = '', initialTo = '', initialSubject = '' }) => {
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialDraft);
  const [tone, setTone] = useState('Professional');
  const [loading, setLoading] = useState(false);
  const [aiTransforming, setAiTransforming] = useState(false);
  const [previousDrafts, setPreviousDrafts] = useState([]);
  const [showScheduleMenu, setShowScheduleMenu] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    setBody(initialDraft);
    if (initialTo) setTo(initialTo);
    if (initialSubject) setSubject(initialSubject);
    setPreviousDrafts([]);
    setShowScheduleMenu(false);
    setIsMinimized(false);
  }, [initialDraft, initialTo, initialSubject, isOpen]);

  if (!isOpen) return null;

  const handleApplyAiTransformation = async (action) => {
    if (!body?.trim()) return;
    setAiTransforming(true);
    setPreviousDrafts((prev) => [...prev, body]);

    try {
      const res = await api.polishDraft(body, action, tone);
      if (res?.polished) {
        setBody(res.polished);
      }
    } catch (e) {
      console.error('Failed to polish draft', e);
    } finally {
      setAiTransforming(false);
    }
  };

  const handleUndo = () => {
    if (previousDrafts.length === 0) return;
    const lastDraft = previousDrafts[previousDrafts.length - 1];
    setBody(lastDraft);
    setPreviousDrafts((prev) => prev.slice(0, prev.length - 1));
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!to || !subject || !body) return;
    setLoading(true);
    try {
      const msg = await api.sendEmail(to, subject, body);
      if (onEmailSent) onEmailSent(msg);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSend = async (sendAt) => {
    if (!to || !subject || !body) return;
    setLoading(true);
    setShowScheduleMenu(false);
    try {
      const msg = await api.scheduleEmail(to, subject, body, sendAt);
      if (onEmailSent) onEmailSent(msg);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: '60px',
      width: '580px',
      height: isMinimized ? '44px' : '540px',
      background: 'var(--bg-panel)',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      boxShadow: 'var(--shadow-compose)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      border: '1px solid var(--border-subtle)',
      transition: 'height 0.2s ease'
    }} className="animate-fade-in">
      
      {/* Gmail Window Header Bar */}
      <div style={{
        height: '44px',
        padding: '0 16px',
        background: 'var(--bg-input)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        userSelect: 'none'
      }}
      onClick={() => setIsMinimized(!isMinimized)}
      >
        <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-main)', fontFamily: 'var(--font-gmail)' }}>
          {subject ? subject : 'New Message'}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
          >
            {isMinimized ? <ChevronUp size={16} /> : <Minus size={16} />}
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <form onSubmit={handleSend} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Recipient Input */}
          <div style={{ padding: '4px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', width: '60px' }}>To</span>
            <input
              type="email"
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Recipients"
              style={{
                flex: 1,
                padding: '8px 0',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                outline: 'none',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-gmail)'
              }}
            />
          </div>

          {/* Subject Input */}
          <div style={{ padding: '4px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              style={{
                width: '100%',
                padding: '8px 0',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                outline: 'none',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-gmail)'
              }}
            />
          </div>

          {/* Gemini Refine Pill Bar */}
          <div style={{
            padding: '6px 16px',
            background: 'var(--bg-app)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', fontWeight: '700', color: 'var(--primary)' }}>
              <Wand2 size={13} />
              <span>Gemini AI:</span>
            </div>

            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
              <button
                type="button"
                onClick={() => handleApplyAiTransformation('polish')}
                disabled={aiTransforming || !body}
                className="btn-secondary"
                style={{ padding: '3px 8px', fontSize: '0.74rem' }}
              >
                <Sparkles size={11} color="var(--primary)" /> Polish
              </button>

              <button
                type="button"
                onClick={() => handleApplyAiTransformation('shorten')}
                disabled={aiTransforming || !body}
                className="btn-secondary"
                style={{ padding: '3px 8px', fontSize: '0.74rem' }}
              >
                <Scissors size={11} /> Shorten
              </button>

              <button
                type="button"
                onClick={() => handleApplyAiTransformation('expand')}
                disabled={aiTransforming || !body}
                className="btn-secondary"
                style={{ padding: '3px 8px', fontSize: '0.74rem' }}
              >
                <Maximize2 size={11} /> Expand
              </button>
            </div>

            {previousDrafts.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}
                title="Undo AI edit"
              >
                <Undo2 size={14} />
              </button>
            )}
          </div>

          {/* Body Textarea */}
          <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column' }}>
            <textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                outline: 'none',
                fontFamily: 'var(--font-gmail)',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                resize: 'none'
              }}
            />
          </div>

          {/* Gmail Bottom Action Toolbar */}
          <div style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-panel)'
          }}>
            {/* Send Pill Button + Schedule Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <button
                type="submit"
                disabled={loading || aiTransforming}
                className="btn-primary"
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, padding: '8px 20px' }}
              >
                Send
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowScheduleMenu(!showScheduleMenu)}
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, padding: '8px 8px', borderLeft: '1px solid rgba(255,255,255,0.3)' }}
                title="Schedule send options"
              >
                <ChevronDown size={14} />
              </button>

              {showScheduleMenu && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  marginBottom: '8px',
                  width: '220px',
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-modal)',
                  zIndex: 200,
                  overflow: 'hidden'
                }} className="animate-fade-in">
                  <div style={{ padding: '8px 12px', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)' }}>
                    SCHEDULE SEND
                  </div>
                  {[
                    { label: 'Tomorrow morning', time: 'Tomorrow 9:00 AM' },
                    { label: 'Tomorrow afternoon', time: 'Tomorrow 1:00 PM' },
                    { label: 'Next Monday morning', time: 'Next Monday 9:00 AM' }
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleScheduleSend(s.time)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 14px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-main)',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <span style={{ fontWeight: '600' }}>{s.label}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.time}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Formatting & Attachment Action Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)' }}>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }} title="Attach files">
                <Paperclip size={18} />
              </button>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }} title="Insert link">
                <Link2 size={18} />
              </button>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }} title="Insert photo">
                <Image size={18} />
              </button>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }} title="Confidential mode">
                <Lock size={18} />
              </button>
              <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', marginLeft: '12px' }} title="Discard draft">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
