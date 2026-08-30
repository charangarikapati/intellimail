import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ListChecks, HelpCircle, CornerUpLeft, 
  Archive, Trash2, Clock, RotateCcw, Zap, GitCommit, CheckCircle, HelpCircle as QuestionIcon,
  FileText, Globe
} from 'lucide-react';
import { api } from '../services/api';

const cleanBodyText = (text) => {
  if (!text) return '';
  // If text contains HTML tags, strip them cleanly
  let cleaned = text;
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  cleaned = cleaned.replace(/<(head|style|script|xml)[^>]*>[\s\S]*?<\/\1>/gi, '');
  cleaned = cleaned.replace(/<(br|p|div|tr|h1|h2|h3|h4|h5|h6|li|blockquote)[^>]*>/gi, '\n');
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');
  // Unescape basic entities
  cleaned = cleaned.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  // Clean whitespace
  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.join('\n\n');
};

export const EmailDetail = ({ email, onArchive, onDelete, onRestore, onOpenReply, onSnooze, onUnsnooze, onBackToList }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [activeAiTab, setActiveAiTab] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false);
  const [viewMode, setViewMode] = useState('text'); // 'text' | 'html'

  // Smart Quick Reply Options
  const [quickReplies, setQuickReplies] = useState([]);
  const [quickRepliesLoading, setQuickRepliesLoading] = useState(false);

  // Thread Synthesis
  const [threadSynthesis, setThreadSynthesis] = useState(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [showThreadView, setShowThreadView] = useState(false);

  // Automatically load Quick Reply suggestions when selected email changes
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
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-dim)',
        gap: '12px',
        padding: '20px'
      }}>
        <div style={{ padding: '16px', borderRadius: '50%', background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)' }}>
          <Sparkles size={28} color="var(--primary)" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', display: 'block' }}>
            No Email Selected
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Select a message from the list to view full details and AI tools
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
    setThreadLoading(true);
    try {
      const messages = [
        { sender: email.sender, snippet: email.snippet, body: email.body }
      ];
      const res = await api.synthesizeThread(email.threadId || email.id, messages);
      setThreadSynthesis(res);
      setShowThreadView(true);
    } catch (e) {
      console.error(e);
    } finally {
      setThreadLoading(false);
    }
  };

  const snoozePresets = [
    { label: 'Later Today', time: '6:00 PM' },
    { label: 'Tomorrow Morning', time: 'Tomorrow 9:00 AM' },
    { label: 'This Weekend', time: 'Saturday 10:00 AM' },
    { label: 'Next Week', time: 'Next Monday 9:00 AM' }
  ];

  return (
    <div style={{ flex: '1', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }} className="animate-fade-in">
      {/* Top Action Toolbar */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-app)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onBackToList && (
            <button className="btn-secondary" onClick={onBackToList} style={{ fontWeight: '700', color: 'var(--primary)' }}>
              ← Back
            </button>
          )}
          {email.isDeleted ? (
            <button className="btn-secondary" onClick={() => onRestore(email.id)} style={{ color: 'var(--status-low)' }}>
              <RotateCcw size={14} /> Restore to Inbox
            </button>
          ) : (
            <>
              <button className="btn-secondary" onClick={() => onArchive(email.id)}>
                <Archive size={14} /> {email.isArchived ? 'Unarchive' : 'Archive'}
              </button>
              <button className="btn-secondary" onClick={() => onDelete(email.id)}>
                <Trash2 size={14} color="var(--status-high)" /> Move to Trash
              </button>

              {/* Snooze Action with Dropdown */}
              {email.isSnoozed ? (
                <button className="btn-secondary" onClick={() => onUnsnooze(email.id)} style={{ color: 'var(--status-medium)' }}>
                  <Clock size={14} /> Unsnooze
                </button>
              ) : (
                <div style={{ position: 'relative' }}>
                  <button className="btn-secondary" onClick={() => setIsSnoozeOpen(!isSnoozeOpen)}>
                    <Clock size={14} /> Snooze
                  </button>

                  {isSnoozeOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '6px',
                      width: '180px',
                      background: 'var(--bg-panel)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: 'var(--shadow-modal)',
                      zIndex: 200,
                      overflow: 'hidden'
                    }} className="animate-fade-in">
                      <div style={{ padding: '6px 10px', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)' }}>
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
                          <span style={{ fontWeight: '600' }}>{preset.label}</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{preset.time}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <button className="btn-secondary" onClick={handleLoadThreadSynthesis} title="Synthesize full conversation thread">
            <GitCommit size={14} color="var(--primary)" /> {showThreadView ? 'Hide Thread Insights' : 'Thread Insights'}
          </button>
        </div>

        {!email.isDeleted && (
          <button className="btn-primary" onClick={() => handleRunAiAction('reply')}>
            <CornerUpLeft size={14} /> Draft AI Reply
          </button>
        )}
      </div>

      {/* Main Container */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Email Subject & Sender Bar */}
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.3' }}>
              {email.subject}
            </h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              {email.isDeleted && (
                <span className="badge badge-high">In Trash</span>
              )}
              {email.isSnoozed && (
                <span className="badge badge-medium" style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#d97706', border: '1px solid rgba(217, 119, 6, 0.3)' }}>
                  ⏰ Snoozed ({email.snoozedUntil})
                </span>
              )}
              <span className={`badge badge-${email.priority?.toLowerCase() || 'medium'}`}>
                {email.priority || 'Medium'} Priority
              </span>
              <span className="badge badge-category">{email.category}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <div>
              <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>From: </span>{email.sender}
            </div>
            <span>{email.date}</span>
          </div>
        </div>

        {/* AI Action Control Bar */}
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--primary-light)',
          border: '1px solid var(--primary-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} color="var(--primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                AI Assistant Toolbar
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn-ai-pill"
              onClick={() => handleRunAiAction('summary')}
              style={{ background: activeAiTab === 'summary' ? 'var(--primary)' : undefined, color: activeAiTab === 'summary' ? '#ffffff' : undefined }}
            >
              <Sparkles size={13} /> Summarize
            </button>
            <button
              className="btn-ai-pill"
              onClick={() => handleRunAiAction('explain')}
              style={{ background: activeAiTab === 'explain' ? 'var(--primary)' : undefined, color: activeAiTab === 'explain' ? '#ffffff' : undefined }}
            >
              <HelpCircle size={13} /> Explain
            </button>
            <button
              className="btn-ai-pill"
              onClick={() => handleRunAiAction('actions')}
              style={{ background: activeAiTab === 'actions' ? 'var(--primary)' : undefined, color: activeAiTab === 'actions' ? '#ffffff' : undefined }}
            >
              <ListChecks size={13} /> Action Items
            </button>
          </div>

          {/* AI Result Callout Box */}
          {aiLoading && (
            <div style={{ padding: '10px', color: 'var(--primary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={14} className="animate-spin" /> Processing AI analysis...
            </div>
          )}

          {aiResult && !aiLoading && (
            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.84rem'
            }} className="animate-fade-in">
              {aiResult.type === 'summary' && (
                <div>
                  <h4 style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>Executive Summary</h4>
                  <p style={{ color: 'var(--text-main)', marginBottom: '8px', lineHeight: '1.5' }}>
                    {aiResult.data.summary}
                  </p>
                  {aiResult.data.keyPoints?.length > 0 && (
                    <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      {aiResult.data.keyPoints.map((pt, idx) => <li key={idx}>{pt}</li>)}
                    </ul>
                  )}
                  {aiResult.data.datesMentioned?.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--status-medium)', fontSize: '0.78rem', fontWeight: '600' }}>
                      <Clock size={13} /> Deadlines & Dates: {aiResult.data.datesMentioned.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {aiResult.type === 'explain' && (
                <div>
                  <h4 style={{ color: 'var(--status-info)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>Simplified Breakdown</h4>
                  <p style={{ color: 'var(--text-main)', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                    {aiResult.data.explanation}
                  </p>
                </div>
              )}

              {aiResult.type === 'actions' && (
                <div>
                  <h4 style={{ color: 'var(--status-low)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Action Items</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {aiResult.data.actionItems?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-app)', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-main)' }}>☐ {item.task}</span>
                        {item.deadline && (
                          <span style={{ fontSize: '0.74rem', color: 'var(--status-high)', fontWeight: '600' }}>
                            Due: {item.deadline}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapsible Thread Synthesis Section */}
        {showThreadView && threadSynthesis && (
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--primary-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }} className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GitCommit size={16} color="var(--primary)" />
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-main)' }}>Conversation Thread Synthesis</h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {threadSynthesis.overallSummary}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
              <div style={{ background: 'var(--bg-app)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--status-low)', fontSize: '0.78rem', fontWeight: '700' }}>
                  <CheckCircle size={13} /> Key Decisions
                </div>
                <ul style={{ paddingLeft: '16px', fontSize: '0.76rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                  {threadSynthesis.keyDecisions?.map((kd, i) => <li key={i}>{kd}</li>)}
                </ul>
              </div>

              <div style={{ background: 'var(--bg-app)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--status-medium)', fontSize: '0.78rem', fontWeight: '700' }}>
                  <QuestionIcon size={13} /> Open Items / Questions
                </div>
                <ul style={{ paddingLeft: '16px', fontSize: '0.76rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                  {threadSynthesis.pendingQuestions?.map((pq, i) => <li key={i}>{pq}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Email Message Content Body - Rendered Naturally */}
        {(email.htmlBody || (email.body && (email.body.includes('<html') || email.body.includes('<!doctype') || email.body.includes('<div') || email.body.includes('<p') || email.body.includes('<table')))) ? (
          <div style={{
            borderRadius: 'var(--radius-md)',
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <iframe
              title="Email Content"
              srcDoc={email.htmlBody || email.body}
              sandbox="allow-same-origin allow-popups"
              style={{
                width: '100%',
                minHeight: '520px',
                border: 'none',
                display: 'block'
              }}
            />
          </div>
        ) : (
          <div style={{
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.9rem',
            color: 'var(--text-main)',
            lineHeight: '1.7',
            whiteSpace: 'pre-line'
          }}>
            {cleanBodyText(email.body)}
          </div>
        )}

        {/* Smart One-Click Quick-Reply Chips */}
        {!email.isDeleted && (
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} color="var(--primary)" />
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                One-Click Smart Reply Suggestions
              </span>
            </div>

            {quickRepliesLoading ? (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', padding: '6px 0' }}>
                Analyzing email context for quick replies...
              </div>
            ) : quickReplies?.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {quickReplies.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => onOpenReply(option.fullDraft)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.background = 'var(--primary-light)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.background = 'var(--bg-app)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)' }}>
                        {option.label}
                      </span>
                      <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'var(--bg-panel)', color: 'var(--text-muted)' }}>
                        {option.tone}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                      {option.preview}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Click 'Draft AI Reply' to customize tone and generate a tailored response.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

