import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { EmailList } from './components/EmailList';
import { EmailDetail } from './components/EmailDetail';
import { ComposeModal } from './components/ComposeModal';
import { AIBriefingModal } from './components/AIBriefingModal';
import { SettingsModal } from './components/SettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { LoginScreen } from './components/LoginScreen';
import { api } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';

function MainApp() {
  const { isAuthenticated, authLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState('inbox');
  const [activeCategory, setActiveCategory] = useState('all');
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Draft state for reply modal
  const [composeInitialDraft, setComposeInitialDraft] = useState('');
  const [composeInitialTo, setComposeInitialTo] = useState('');
  const [composeInitialSubject, setComposeInitialSubject] = useState('');

  // Fetch emails
  const fetchEmails = async (cat = activeCategory) => {
    setLoading(true);
    try {
      const data = await api.getEmails(cat);
      setEmails(data);
      if (data.length > 0 && !selectedEmail) {
        // Select first inbox email
        const inboxEmails = data.filter(m => !m.isDeleted && !m.isArchived && !m.isSnoozed);
        setSelectedEmail(inboxEmails.length > 0 ? inboxEmails[0] : data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmails(activeCategory);
    }
  }, [activeCategory, isAuthenticated]);

  // Tab Filter Helper
  const getFilteredEmails = () => {
    if (activeTab === 'trash') return emails.filter(m => m.isDeleted);
    if (activeTab === 'starred') return emails.filter(m => m.isStarred && !m.isDeleted && !m.isSnoozed);
    if (activeTab === 'snoozed') return emails.filter(m => m.isSnoozed && !m.isDeleted);
    if (activeTab === 'sent') return emails.filter(m => (m.isSent || (user?.email && m.senderEmail?.toLowerCase().includes(user.email.toLowerCase()))) && !m.isDeleted);
    if (activeTab === 'archive') return emails.filter(m => m.isArchived && !m.isDeleted && !m.isSent);
    // Default Inbox
    return emails.filter(m => !m.isArchived && !m.isDeleted && !m.isSnoozed && !m.isSent);
  };

  const currentFiltered = getFilteredEmails();

  // Switch selected email when active tab changes if selected email is not in active view
  useEffect(() => {
    const filtered = getFilteredEmails();
    if (filtered.length > 0 && (!selectedEmail || !filtered.some(m => m.id === selectedEmail.id))) {
      setSelectedEmail(filtered[0]);
    } else if (filtered.length === 0) {
      setSelectedEmail(null);
    }
  }, [activeTab, emails]);

  // Search handler
  const handleSearch = async (query) => {
    if (!query) {
      fetchEmails(activeCategory);
      return;
    }
    setLoading(true);
    const results = await api.searchEmails(query);
    setEmails(results);
    if (results.length > 0) setSelectedEmail(results[0]);
    setLoading(false);
  };

  // Actions
  const handleToggleStar = async (id) => {
    await api.toggleStar(id);
    setEmails(prev => prev.map(m => m.id === id ? { ...m, isStarred: !m.isStarred } : m));
  };

  const handleArchive = async (id) => {
    await api.toggleArchive(id);
    setEmails(prev => prev.map(m => m.id === id ? { ...m, isArchived: !m.isArchived } : m));
  };

  const handleDelete = async (id) => {
    await api.deleteEmail(id);
    setEmails(prev => prev.map(m => m.id === id ? { ...m, isDeleted: true } : m));
  };

  const handleRestore = async (id) => {
    await api.restoreEmail(id);
    setEmails(prev => prev.map(m => m.id === id ? { ...m, isDeleted: false } : m));
  };

  const handleSnooze = async (id, snoozeUntil) => {
    await api.snoozeEmail(id, snoozeUntil);
    setEmails(prev => prev.map(m => m.id === id ? { ...m, isSnoozed: true, snoozedUntil: snoozeUntil } : m));
  };

  const handleUnsnooze = async (id) => {
    await api.unsnoozeEmail(id);
    setEmails(prev => prev.map(m => m.id === id ? { ...m, isSnoozed: false, snoozedUntil: null } : m));
  };

  const handleEmailSent = (newMsg) => {
    if (newMsg) {
      setEmails(prev => [newMsg, ...prev]);
      setSelectedEmail(newMsg);
    }
  };

  const handleOpenAiReplyDraft = (draftText) => {
    setComposeInitialDraft(draftText || '');
    setComposeInitialTo(selectedEmail?.senderEmail || '');
    setComposeInitialSubject(`Re: ${selectedEmail?.subject || ''}`);
    setIsComposeOpen(true);
  };

  const handleOpenNewCompose = () => {
    setComposeInitialDraft('');
    setComposeInitialTo('');
    setComposeInitialSubject('');
    setIsComposeOpen(true);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName;
      const isInput = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable;

      if (e.key === 'Escape') {
        setIsComposeOpen(false);
        setIsBriefingOpen(false);
        setIsSettingsOpen(false);
        setIsShortcutsOpen(false);
        return;
      }

      if (isInput) return; // Don't intercept typing in forms

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        const list = currentFiltered;
        if (list.length === 0) return;
        const currIndex = list.findIndex(m => m.id === selectedEmail?.id);
        if (currIndex < list.length - 1) {
          setSelectedEmail(list[currIndex + 1]);
        }
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        const list = currentFiltered;
        if (list.length === 0) return;
        const currIndex = list.findIndex(m => m.id === selectedEmail?.id);
        if (currIndex > 0) {
          setSelectedEmail(list[currIndex - 1]);
        }
      } else if (e.key === 'c') {
        e.preventDefault();
        handleOpenNewCompose();
      } else if (e.key === 'r') {
        e.preventDefault();
        if (selectedEmail && !selectedEmail.isDeleted) {
          handleOpenAiReplyDraft('');
        }
      } else if (e.key === 's') {
        e.preventDefault();
        if (selectedEmail) {
          handleToggleStar(selectedEmail.id);
        }
      } else if (e.key === 'e') {
        e.preventDefault();
        if (selectedEmail && !selectedEmail.isDeleted) {
          handleArchive(selectedEmail.id);
        }
      } else if (e.key === '#' || e.key === 'Delete') {
        e.preventDefault();
        if (selectedEmail && !selectedEmail.isDeleted) {
          handleDelete(selectedEmail.id);
        }
      } else if (e.key === 'b') {
        e.preventDefault();
        setIsBriefingOpen(true);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFiltered, selectedEmail]);

  if (authLoading) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '28px', height: '28px', border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: '0.86rem', fontWeight: '600' }}>Initializing IntelliMail...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Navbar
        onSearch={handleSearch}
        onOpenBriefing={() => setIsBriefingOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onRefresh={() => fetchEmails(activeCategory)}
      />

      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          onOpenCompose={handleOpenNewCompose}
          emails={emails}
        />

        {/* Main Content Split: Email List (Left) + Detail Reader (Right) */}
        <main style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden' }}>
          <div style={{
            width: '360px',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: 'var(--bg-list)',
            transition: 'background-color 0.2s ease'
          }}>
            <EmailList
              emails={currentFiltered}
              selectedEmail={selectedEmail}
              onSelectEmail={setSelectedEmail}
              onToggleStar={handleToggleStar}
              loading={loading}
            />
          </div>

          <div style={{ flex: 1, height: '100%', overflow: 'hidden', background: 'var(--bg-app)', transition: 'background-color 0.2s ease' }}>
            <EmailDetail
              email={selectedEmail}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onOpenReply={handleOpenAiReplyDraft}
              onSnooze={handleSnooze}
              onUnsnooze={handleUnsnooze}
            />
          </div>
        </main>
      </div>

      {/* Dialog Modals */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onEmailSent={handleEmailSent}
        initialDraft={composeInitialDraft}
        initialTo={composeInitialTo}
        initialSubject={composeInitialSubject}
      />

      <AIBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
