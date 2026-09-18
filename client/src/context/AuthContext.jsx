import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, getErrorMessage } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.me();
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      setUser(null);
      if (error.response?.status !== 401) throw error;
      return null;
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const authenticate = useCallback(async (action, payload) => {
    try {
      const response = await action(payload);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const login = useCallback((payload) => authenticate(authApi.login, payload), [authenticate]);
  const register = useCallback((payload) => authenticate(authApi.register, payload), [authenticate]);
  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout, refreshUser, setUser }), [user, loading, login, register, logout, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}

