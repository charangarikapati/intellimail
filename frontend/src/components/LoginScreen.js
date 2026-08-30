import React from 'react';
import { Sparkles, Shield, Zap, Clock, Inbox, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginScreen = () => {
  const { loginWithGoogle, loginAsDemo, theme, toggleTheme } = useAuth();

  const features = [
    { icon: Sparkles, title: 'AI Executive Briefings', desc: 'Instant 2-sentence summaries & extracted action items' },
    { icon: Zap, title: 'Smart 1-Click Quick Replies', desc: 'Context-aware suggestions tailored to your conversation' },
    { icon: Clock, title: 'Snooze & Scheduled Send', desc: 'Set smart reminders and schedule future email dispatches' },
    { icon: Shield, title: 'Enterprise-Grade Security', desc: 'Direct Google OAuth 2.0 with encrypted cloud storage' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'var(--bg-app)',
      color: 'var(--text-main)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decorative Glows */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '20%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
        pointerEvents: 'none',
        filter: 'blur(40px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '15%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(244, 63, 94, 0.12) 0%, rgba(244, 63, 94, 0) 70%)',
        pointerEvents: 'none',
        filter: 'blur(40px)'
      }} />

      {/* Header */}
      <header style={{
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(var(--bg-panel-rgb, 15, 23, 42), 0.6)',
        backdropFilter: 'blur(10px)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)'
          }}>
            <Inbox size={18} />
          </div>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.3px', color: 'var(--text-main)' }}>
              Intelli<span style={{ color: 'var(--primary)' }}>Mail</span>
            </span>
            <span style={{ fontSize: '0.68rem', marginLeft: '6px', padding: '1px 6px', borderRadius: '4px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '700' }}>
              v2.0 PRO
            </span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: '1px solid var(--border-subtle)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </header>

      {/* Hero Section */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        zIndex: 10
      }}>
        <div className="login-grid" style={{
          maxWidth: '1000px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '40px',
          alignItems: 'center'
        }}>
          {/* Left Column: Value Proposition */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              color: 'var(--primary)',
              fontSize: '0.78rem',
              fontWeight: '700',
              marginBottom: '16px'
            }}>
              <Sparkles size={13} /> Next-Generation Email Intelligence
            </div>

            <h1 className="login-hero-title" style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              lineHeight: '1.18',
              letterSpacing: '-0.8px',
              marginBottom: '16px',
              color: 'var(--text-main)'
            }}>
              Transform your inbox with <span style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Gemini AI</span> superpowers.
            </h1>

            <p style={{
              fontSize: '1rem',
              color: 'var(--text-muted)',
              lineHeight: '1.6',
              marginBottom: '28px'
            }}>
              Summarize long threads into instant decisions, generate context-aware replies with custom tones, snooze emails, and automate action items directly connected to your Gmail.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div key={idx} style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: '0.82rem' }}>
                      <Icon size={15} />
                      <span>{feat.title}</span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>{feat.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Sign In Card */}
          <div className="login-card" style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '36px 30px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
                Welcome to IntelliMail
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Sign in to connect your live Gmail or test in Demo Mode
              </p>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={loginWithGoogle}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: 'var(--radius-sm)',
                background: '#ffffff',
                color: '#1f2937',
                border: '1px solid #d1d5db',
                fontSize: '0.92rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Google G Logo SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              <span>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            </div>

            {/* Explore Demo Mode Button */}
            <button
              onClick={loginAsDemo}
              style={{
                width: '100%',
                padding: '11px 18px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '0.86rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Explore in Demo Mode</span>
              <ArrowRight size={15} />
            </button>

            <div style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-low)', fontWeight: '600' }}>
                <CheckCircle2 size={13} />
                <span>Full privacy guarantee</span>
              </div>
              <span>Your tokens and emails remain protected. We never sell or share your personal data.</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '12px 32px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.74rem',
        color: 'var(--text-dim)'
      }}>
        <span>IntelliMail v2.0 • FastAPI + React + Google Gemini Pro</span>
        <span>Keyboard shortcuts: <kbd style={{ padding: '1px 5px', background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: '3px' }}>?</kbd></span>
      </footer>
    </div>
  );
};
