import React, { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../lib/api';

interface User {
  user_id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: () => void;
  logout: () => void;
  error: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const saved = localStorage.getItem('loggate_jwt');
    if (!saved || saved === 'undefined' || saved === 'null' || saved.trim() === '') {
      localStorage.removeItem('loggate_jwt');
      return null;
    }
    return saved;
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('loggate_user');
    if (!saved || saved === 'undefined' || saved === 'null') {
      localStorage.removeItem('loggate_user');
      return null;
    }
    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem('loggate_user');
      return null;
    }
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login({ email, password });
      if (!res.token) {
        throw new Error('Authentication succeeded but no access token was returned');
      }
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('loggate_jwt', res.token);
      localStorage.setItem('loggate_user', JSON.stringify(res.user));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginDemo = useCallback(() => {
    const demoToken = 'demo_jwt_token_loggate_admin';
    const demoUser: User = { user_id: 'demo-1', email: 'admin@loggate.io', username: 'Platform Admin' };
    setToken(demoToken);
    setUser(demoUser);
    localStorage.setItem('loggate_jwt', demoToken);
    localStorage.setItem('loggate_user', JSON.stringify(demoUser));
    setError(null);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('loggate_jwt');
    localStorage.removeItem('loggate_user');
  }, []);

  const isDemo = token === 'demo_jwt_token_loggate_admin';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(token), isDemo, token, login, loginDemo, logout, error, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
