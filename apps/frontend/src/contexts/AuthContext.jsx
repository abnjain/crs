// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/config/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (tkn) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tkn}`,
      };
      const res = await api.get('/auth/users/me', { headers });
      console.log(res.data.message);
      setUser({
        ...res.data.user,
        roles: Array.isArray(res.data.user.roles) ? res.data.user.roles : [res.data.user.roles].filter(Boolean)
      });
      return { user: res.data.user, success: true };
    } catch (err) {
      console.error('Failed to fetch user');
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password) => {
    try {
      const res = await api.post('/auth/register', { email, password });
      console.log(res.data.message);
      const { token, refresh } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refresh', refresh);
      setToken(token);
      await fetchUser(token);
      return { success: true, user: res.data.user };
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      console.log(res.data.message);
      const { token, refresh } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refresh', refresh);
      setToken(token);
      await fetchUser(token);
      return { success: true, user: res.data.user };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/logout');
      console.log(res.data.message);
    } catch (error) {
      console.warn('Logout request failed (maybe already logged out)');
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    register,
    login,
    logout,
    isLoading,
    isAuthenticated: !!token && !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}