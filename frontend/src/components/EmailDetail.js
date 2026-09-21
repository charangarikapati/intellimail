import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ListChecks, HelpCircle, CornerUpLeft, 
  Archive, Trash2, Clock, RotateCcw, Zap, GitCommit, CheckCircle, HelpCircle as QuestionIcon,
  ArrowLeft, AlertOctagon, Mail, Tag, Folder, Star, Forward, ChevronDown
} from 'lucide-react';
import { api } from '../services/api';

const cleanBodyText = (text) => {
  if (!text) return '';
  let cleaned = text;
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  cleaned = cleaned.replace(/<(head|style|script|xml)[^>]*>[\s\S]*?<\/\1>/gi, '');
  cleaned = cleaned.replace(/<(br|p|div|tr|h1|h2|h3|h4|h5|h6|li|blockquote)[^>]*>/gi, '\n');
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');
  cleaned = cleaned.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.join('\n\n');
};

export const EmailDetail = ({ email, onArchive, onDelete, onRestore, onOpenReply, onSnooze, onUnsnooze, onBackToList }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [activeAiTab, setActiveAiTab] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false);

  const [quickReplies, setQuickReplies] = useState([]);
  const [quickRepliesLoading, setQuickRepliesLoading] = useState(false);

  const [threadSynthesis, setThreadSynthesis] = useState(null);
  const [showThreadView, setShowThreadView] = useState(false);

  useEffect(() => {
    if (!email) return;
    setAiResult(null);
    setActiveAiTab(null);
    setThreadSynthesis(null);
    setShowThreadView(false);
    setIsSnoozeOpen(false);

    let isMounted = true;
    const loadQuickReplies = async () => {
      setQuickRepliesLoading(true);
      try {
        const res = await api.getQuickReplies(email.id, email.body || email.snippet);
        if (isMounted && res?.options) {
          setQuickReplies(res.options);
        }
      } catch (err) {
        console.error('Failed to load quick replies', err);
      } finally {
        if (isMounted) setQuickRepliesLoading(false);
      }
    };

    loadQuickReplies();
    return () => { isMounted = false; };
  }, [email]);

  if (!email) {
    return (
      <div className="gmail-container-card" style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-dim)',
        gap: '12px',
        padding: '20px'
      }}>
        <div style={{ padding: '20px', borderRadius: '50%', background: 'var(--bg-app)' }}>
          <Sparkles size={36} color="var(--primary)" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: '500', color: 'var(--text-main)', display: 'block', fontFamily: 'var(--font-gmail)' }}>
            No conversation selected
          </span>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Choose an email from the list to view full details and Gemini AI options
          </span>
        </div>
      </div>
    );
  }

  const handleRunAiAction = async (actionType) => {
    setAiLoading(true);
    setActiveAiTab(actionType);
    setAiResult(null);

    try {
      if (actionType === 'summary') {
        const res = await api.summarizeEmail(email.id, email.body);
        setAiResult({ type: 'summary', data: res });
      } else if (actionType === 'explain') {
        const res = await api.explainEmail(email.id, email.body);
        setAiResult({ type: 'explain', data: res });
      } else if (actionType === 'actions') {
        const res = await api.extractActions(email.id, email.body);
        setAiResult({ type: 'actions', data: res });
      } else if (actionType === 'reply') {
        const res = await api.generateReply(email.id, email.body, 'Professional');
        onOpenReply(res.replyDraft);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleLoadThreadSynthesis = async () => {
    if (threadSynthesis) {
      setShowThreadView(!showThreadView);
      return;
    }
    try {
      const messages = [{ sender: email.sender, snippet: email.snippet, body: email.body }];
      const res = await api.synthesizeThread(email.threadId || email.id, messages);
      setThreadSynthesis(res);
      setShowThreadView(true);
    } catch (e) {
      console.error(e);
    }
  };

  const snoozePresets = [
    { label: 'Later Today', time: '6:00 PM' },
    { label: 'Tomorrow Morning', time: 'Tomorrow 9:00 AM' },
    { label: 'This Weekend', time: 'Saturday 10:00 AM' },
    { label: 'Next Week', time: 'Next Monday 9:00 AM' }
  ];

  const senderInitial = email.sender ? email.sender.charAt(0).toUpperCase() : 'U';

  return (
    <div className="gmail-container-card" style={{ flex: '1', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      
      {/* Gmail Reading View Top Toolbar */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-panel)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBackToList}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
            title="Back to inbox"
          >
            <ArrowLeft size={18} />
          </button>

          <button
            onClick={() => onArchive(email.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
            title={email.isArchived ? "Unarchive" : "Archive"}
          >
            <Archive size={18} />
          </button>

          <button
            onClick={() => onDelete(email.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-high)', display: 'flex' }}
            title="Delete"
          >
            <Trash2 size={18} />
          </button>

          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
            title="Mark as unread"
          >
            <Mail size={18} />
          </button>

          {/* Snooze Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsSnoozeOpen(!isSnoozeOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
              title="Snooze"
            >
              <Clock size={18} />
            </button>

            {isSnoozeOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                width: '200px',
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-modal)',
                zIndex: 200,
                overflow: 'hidden'
              }} className="animate-fade-in">
                <div style={{ padding: '8px 12px', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)' }}>
                  SNOOZE UNTIL
                </div>
                {snoozePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSnooze(email.id, preset.time);
                      setIsSnoozeOpen(false);
                    }}
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
                    <span style={{ fontWeight: '600' }}>{preset.label}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{preset.time}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleLoadThreadSynthesis}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex' }}
            title="Thread Insights"
          >
            <GitCommit size={18} />
          </button>
        </div>

        <button className="btn-primary" onClick={() => handleRunAiAction('reply')}>
          <CornerUpLeft size={16} /> Reply with AI
        </button>
      </div>

      {/* Main Mail Header & Body Container */}
      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Email Subject Title (Google Sans 22px) */}
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '400', color: 'var(--text-main)', fontFamily: 'var(--font-gmail)', lineHeight: '1.3' }}>
            {email.subject}
          </h1>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <span className="badge badge-category">{email.category}</span>
            <span className={`badge badge-${email.priority?.toLowerCase() || 'medium'}`}>{email.priority} Priority</span>
          </div>
        </div>

        {/* Sender Details Header Card */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            {/* Sender Circle Avatar */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#0b57d0',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1.1rem',
              flexShrink: 0
            }}>
              {senderInitial}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)', fontFamily: 'var(--font-gmail)' }}>
                  {email.sender.split('<')[0]}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  &lt;{email.senderEmail || 'sender@domain.com'}&gt;
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span>to me</span>
                <ChevronDown size={12} />
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            {email.date}
          </div>
        </div>

        {/* Gemini AI Toolbar Callout */}
        <div style={{
          padding: '14px 18px',
          borderRadius: '16px',
          background: 'var(--primary-light)',
          border: '1px solid var(--primary-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-text)', fontWeight: '700', fontSize: '0.84rem' }}>
              <Sparkles size={16} color="var(--primary)" />
              <span>Gemini AI Intelligence Bar</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn-ai-pill"
              onClick={() => handleRunAiAction('summary')}
              style={{ background: activeAiTab === 'summary' ? 'var(--primary)' : undefined, color: activeAiTab === 'summary' ? '#ffffff' : undefined }}
            >
              <Sparkles size={14} /> Summarize Email
            </button>

            <button
              className="btn-ai-pill"
              onClick={() => handleRunAiAction('explain')}
              style={{ background: activeAiTab === 'explain' ? 'var(--primary)' : undefined, color: activeAiTab === 'explain' ? '#ffffff' : undefined }}
            >
              <HelpCircle size={14} /> Explain Context
            </button>

            <button
              className="btn-ai-pill"
              onClick={() => handleRunAiAction('actions')}
              style={{ background: activeAiTab === 'actions' ? 'var(--primary)' : undefined, color: activeAiTab === 'actions' ? '#ffffff' : undefined }}
            >
              <ListChecks size={14} /> Extract Tasks
            </button>
          </div>

          {/* AI Result View */}
          {aiLoading && (
            <div style={{ padding: '8px 0', color: 'var(--primary)', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} className="animate-spin" /> Processing Gemini AI...
            </div>
          )}

          {aiResult && !aiLoading && (
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.88rem'
            }} className="animate-fade-in">
              {aiResult.type === 'summary' && (
                <div>
                  <h4 style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px' }}>Executive Summary</h4>
                  <p style={{ color: 'var(--text-main)', marginBottom: '10px', lineHeight: '1.5' }}>
                    {aiResult.data.summary}
                  </p>
                  {aiResult.data.keyPoints?.length > 0 && (
                    <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      {aiResult.data.keyPoints.map((pt, idx) => <li key={idx}>{pt}</li>)}
                    </ul>
                  )}
                </div>
              )}

              {aiResult.type === 'explain' && (
                <div>
                  <h4 style={{ color: 'var(--status-info)', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px' }}>Simplified Breakdown</h4>
                  <p style={{ color: 'var(--text-main)', lineHeight: '1.5' }}>
                    {aiResult.data.explanation}
                  </p>
                </div>
              )}

              {aiResult.type === 'actions' && (
                <div>
                  <h4 style={{ color: 'var(--status-low)', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px' }}>Extracted Action Items</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {aiResult.data.actionItems?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-app)', borderRadius: '8px' }}>
                        <span>☐ {item.task}</span>
                        {item.deadline && <span style={{ fontSize: '0.78rem', color: 'var(--status-high)', fontWeight: '600' }}>Due: {item.deadline}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Conversation Thread Synthesis Collapsible */}
        {showThreadView && threadSynthesis && (
          <div style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'var(--bg-panel)',
            border: '1px solid var(--primary-border)'
          }} className="animate-fade-in">
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>Thread Synthesis</h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {threadSynthesis.overallSummary}
            </p>
          </div>
        )}

        {/* Email Message Content Body */}
        {(email.htmlBody || (email.body && (email.body.includes('<html') || email.body.includes('<!doctype') || email.body.includes('<div') || email.body.includes('<p')))) ? (
          <div style={{
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden'
          }}>
            <iframe
              title="Email Content"
              srcDoc={email.htmlBody || email.body}
              sandbox="allow-same-origin allow-popups"
              style={{
                width: '100%',
                minHeight: '480px',
                border: 'none',
                display: 'block'
              }}
            />
          </div>
        ) : (
          <div style={{
            fontSize: '0.92rem',
            color: 'var(--text-main)',
            lineHeight: '1.7',
            whiteSpace: 'pre-line',
            fontFamily: 'var(--font-gmail)',
            padding: '12px 0'
          }}>
            {cleanBodyText(email.body)}
          </div>
        )}

        {/* Smart One-Click Quick Reply Chips */}
        {quickReplies?.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
            {quickReplies.map((option) => (
              <button
                key={option.id}
                onClick={() => onOpenReply(option.fullDraft)}
                className="btn-secondary"
                style={{ padding: '8px 16px', borderRadius: '18px' }}
              >
                <Zap size={14} color="var(--primary)" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Bottom Reply & Forward Outline Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={() => onOpenReply('')}
            className="btn-secondary"
            style={{ padding: '10px 24px', borderRadius: '24px', fontSize: '0.88rem' }}
          >
            <CornerUpLeft size={16} /> Reply
          </button>

          <button
            onClick={() => onOpenReply(email.body)}
            className="btn-secondary"
            style={{ padding: '10px 24px', borderRadius: '24px', fontSize: '0.88rem' }}
          >
            <Forward size={16} /> Forward
          </button>
        </div>

      </div>
    </div>
  );
};
