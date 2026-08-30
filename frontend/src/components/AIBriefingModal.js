import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export const AIBriefingModal = ({ isOpen, onClose }) => {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const loadBriefing = async () => {
        setLoading(true);
        const data = await api.getAIBriefing();
        setBriefing(data);
        setLoading(false);
      };
      loadBriefing();
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
        maxWidth: '560px',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        boxShadow: 'var(--shadow-modal)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>Executive Daily Briefing</h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>AI Priority & Inbox Overview</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--primary)', fontSize: '0.85rem' }}>
            Compiling priority briefing...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Priority Counts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', textAlign: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--status-high)' }}>{briefing.highPriority}</span>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>High Priority</span>
              </div>
              <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', textAlign: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--status-medium)' }}>{briefing.mediumPriority}</span>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Medium</span>
              </div>
              <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--status-low)' }}>{briefing.lowPriority}</span>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Low Priority</span>
              </div>
            </div>

            {/* AI Summary Box */}
            <div style={{ padding: '12px 14px', borderRadius: '6px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>Overview</h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                {briefing.briefSummary}
              </p>
            </div>

            {/* Action Items List */}
            <div>
              <h4 style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Action Items Requiring Attention:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {briefing.todayItems?.map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-app)', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={14} color="var(--primary)" />
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: '500' }}>{item.title}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--status-medium)', fontWeight: '600' }}>{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }} onClick={onClose}>
              Dismiss & Open Inbox
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
