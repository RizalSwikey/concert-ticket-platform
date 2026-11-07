import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('reserva_token'));
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('signin'); // 'signin' | 'signup'
  const [postAuthAction, setPostAuthAction] = useState(null);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          }
        } catch (err) {
          console.warn('Failed to load user session:', err.message);
          localStorage.removeItem('reserva_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const signIn = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.token) {
      localStorage.setItem('reserva_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
      if (postAuthAction) {
        postAuthAction(res.user);
        setPostAuthAction(null);
      }
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const signUp = async (name, email, password) => {
    const res = await api.register(name, email, password);
    if (res.success && res.token) {
      localStorage.setItem('reserva_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
      if (postAuthAction) {
        postAuthAction(res.user);
        setPostAuthAction(null);
      }
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const loginDemo = async (name = 'VIP Buyer (Demo Pass)') => {
    try {
      const res = await api.demoLogin(name);
      if (res.success && res.token) {
        localStorage.setItem('reserva_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setIsAuthModalOpen(false);
        if (postAuthAction) {
          postAuthAction(res.user);
          setPostAuthAction(null);
        }
        return res.user;
      }
    } catch (err) {
      console.error('Demo login error:', err);
      throw err;
    }
  };

  const openAuthModal = (tab = 'signin', onAuthenticated = null) => {
    setAuthModalTab(tab);
    if (onAuthenticated) setPostAuthAction(() => onAuthenticated);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPostAuthAction(null);
  };

  const logout = () => {
    localStorage.removeItem('reserva_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        signIn,
        signUp,
        loginDemo,
        logout,
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
