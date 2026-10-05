import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('elqara_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('elqara_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data?.success) {
            setUser(res.data.user);
          }
        } catch (error) {
          console.warn('Session expired or invalid:', error.message);
          localStorage.removeItem('elqara_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data?.success) {
      const { token, user } = res.data;
      localStorage.setItem('elqara_token', token);
      setToken(token);
      setUser(user);
      return user;
    }
  };

  const adminLogin = async (email, password) => {
    const res = await authAPI.adminLogin({ email, password });
    if (res.data?.success) {
      const { token, user } = res.data;
      localStorage.setItem('elqara_token', token);
      setToken(token);
      setUser(user);
      return user;
    }
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.data?.success) {
      const { token, user } = res.data;
      localStorage.setItem('elqara_token', token);
      setToken(token);
      setUser(user);
      return user;
    }
  };

  const logout = () => {
    localStorage.removeItem('elqara_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        adminLogin,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
