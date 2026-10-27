import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('crop_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state on app launch
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('crop_token');
      const storedUser = localStorage.getItem('crop_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify token validity with backend
          await getCurrentUser();
        } catch (error) {
          console.warn('Session expired or invalid, logging out:', error.message);
          localStorage.removeItem('crop_token');
          localStorage.removeItem('crop_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    if (data && data.token) {
      localStorage.setItem('crop_token', data.token);
      localStorage.setItem('crop_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Login failed.');
  };

  const register = async (name, email, password) => {
    const data = await registerUser({ name, email, password });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('crop_token');
    localStorage.removeItem('crop_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
