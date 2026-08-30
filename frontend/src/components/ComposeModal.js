import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, Wand2, Scissors, Maximize2, Briefcase, Smile, Undo2, Clock, ChevronDown } from 'lucide-react';
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

  useEffect(() => {
    setBody(initialDraft);
    if (initialTo) setTo(initialTo);
    if (initialSubject) setSubject(initialSubject);
    setPreviousDrafts([]);
    setShowScheduleMenu(false);
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
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }} className="animate-fade-in">
      <div style={{
        width: '100%',
        maxWidth: '680px',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-modal)'
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-header)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="var(--primary)" />
            <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-main)' }}>Compose & AI Draft Review</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tone Selector Bar */}
        <div style={{
          padding: '8px 18px',
          background: 'var(--bg-app)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem'
        }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Active Tone:</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['Professional', 'Friendly', 'Formal', 'Concise'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: tone === t ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: tone === t ? 'var(--primary-light)' : 'transparent',
                  color: tone === t ? 'var(--primary)' : 'var(--text-dim)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: tone === t ? '600' : '400'
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {previousDrafts.length > 0 && (
            <button
              type="button"
              onClick={handleUndo}
              className="btn-secondary"
              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
              title="Undo last AI transformation"
            >
              <Undo2 size={12} /> Undo
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>To</label>
            <input
              type="email"
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                outline: 'none',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject line..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                outline: 'none',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Message Body (Review & Edit Before Sending)
              </label>
              {aiTransforming && (
                <span style={{ fontSize: '0.74rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} className="animate-spin" /> AI Modifying Text...
                </span>
              )}
            </div>
            <textarea
              required
              rows={7}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Compose email text..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '0.86rem',
                lineHeight: '1.5',
                resize: 'vertical'
              }}
            />

            {/* AI Assistant Composer Action Bar */}
            <div style={{
              marginTop: '8px',
              padding: '8px 10px',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '700' }}>
                <Wand2 size={13} />
                <span>AI Refine:</span>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleApplyAiTransformation('polish')}
                  disabled={aiTransforming || !body}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Fix grammar and enhance clarity"
                >
                  <Sparkles size={11} color="var(--primary)" /> Polish & Grammar
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyAiTransformation('shorten')}
                  disabled={aiTransforming || !body}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Make draft concise"
                >
                  <Scissors size={11} color="var(--status-medium)" /> Shorten
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyAiTransformation('expand')}
                  disabled={aiTransforming || !body}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Elaborate with professional context"
                >
                  <Maximize2 size={11} color="var(--status-info)" /> Expand
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyAiTransformation('formalize')}
                  disabled={aiTransforming || !body}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Formal business vocabulary"
                >
                  <Briefcase size={11} color="var(--primary)" /> Make Formal
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyAiTransformation('friendly')}
                  disabled={aiTransforming || !body}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Warm and friendly conversational tone"
                >
                  <Smile size={11} color="var(--status-low)" /> Make Friendly
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px', position: 'relative' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || aiTransforming}
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: '1px solid rgba(255,255,255,0.2)' }}
              >
                <Send size={14} /> Send Email
              </button>
              
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowScheduleMenu(!showScheduleMenu)}
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, padding: '7px 8px' }}
                title="Schedule email dispatch"
              >
                <ChevronDown size={14} />
              </button>

              {showScheduleMenu && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: 0,
                  marginBottom: '6px',
                  width: '210px',
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-modal)',
                  zIndex: 200,
                  overflow: 'hidden'
                }} className="animate-fade-in">
                  <div style={{ padding: '6px 10px', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)' }}>
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
                        padding: '8px 10px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-main)',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-light)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <span style={{ fontWeight: '600' }}>{s.label}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{s.time}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
