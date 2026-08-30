import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('intellimail_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [preferences, setPreferences] = useState({
    defaultTone: 'Professional',
    language: 'English',
    summaryLength: 'Concise'
  });

  // Theme State ('dark' | 'light')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('intellimail_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('intellimail_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Check URL params for OAuth token callback & initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      const isDemoParam = urlParams.get('demo');

      if (urlToken) {
        localStorage.setItem('intellimail_token', urlToken);
        localStorage.removeItem('intellimail_demo');
        setToken(urlToken);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (isDemoParam === 'true') {
        localStorage.setItem('intellimail_demo', 'true');
        localStorage.removeItem('intellimail_token');
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const storedToken = localStorage.getItem('intellimail_token');
      const isDemoStored = localStorage.getItem('intellimail_demo') === 'true';

      if (storedToken) {
        try {
          const profile = await api.getAuthMe();
          if (profile) {
            setUser(profile);
            setIsAuthenticated(true);
            setIsDemoMode(profile.isDemo ?? false);
          } else {
            // Token expired
            localStorage.removeItem('intellimail_token');
            setIsAuthenticated(false);
          }
        } catch (e) {
          console.error('Failed to verify token:', e);
          setIsAuthenticated(false);
        }
      } else if (isDemoStored) {
        setUser({
          name: 'Charan (Demo)',
          email: 'charan.demo@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          isDemo: true
        });
        setIsAuthenticated(true);
        setIsDemoMode(true);
      } else {
        setIsAuthenticated(false);
      }

      setAuthLoading(false);
    };

    initAuth();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const data = await api.getAuthUrl();
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error('OAuth redirect failed:', e);
    }
  };

  const loginAsDemo = () => {
    localStorage.setItem('intellimail_demo', 'true');
    localStorage.removeItem('intellimail_token');
    setUser({
      name: 'Charan (Demo)',
      email: 'charan.demo@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      isDemo: true
    });
    setIsAuthenticated(true);
    setIsDemoMode(true);
  };

  const logout = async () => {
    await api.disconnectAccount();
    localStorage.removeItem('intellimail_token');
    localStorage.removeItem('intellimail_demo');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setIsDemoMode(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      isDemoMode,
      authLoading,
      preferences,
      setPreferences,
      theme,
      setTheme,
      toggleTheme,
      loginWithGoogle,
      loginAsDemo,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
