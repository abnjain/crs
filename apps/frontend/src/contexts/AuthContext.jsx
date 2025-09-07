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
      setUser(res.data.user);
      return { user: res.data.user, success: true };
    } catch (err) {
      console.error('Failed to fetch user');
      logout();
    } finally {
      setIsLoading(false);
    }
  };
// debugger 
  const register  = async (email, password) => {
    try {
      const res = await api.post('/auth/register', { email, password });
      console.log(res.data.message);  
      const { token } = res.data;
      localStorage.setItem('token', token);
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

// debugger 
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      console.log(res.data.message);  
      const { token } = res.data;
      localStorage.setItem('token', token);
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
    try {
      await api.post('/auth/logout');
      console.log(res.data.message);  
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      api.post('/auth/logout').catch(() => {});
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
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