'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    authAPI.me()
      .then(res => setUser(res.data.user))
      .catch(() => {
        if (token) {
          localStorage.removeItem('token');
        }
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (data) => {
    const res = await authAPI.login(data);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    setUser(res.data.user);
    return res.data;
  };

  const loginWithGoogle = async (googleToken) => {
    const res = await authAPI.googleLogin(googleToken);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    const me = await authAPI.me();
    setUser(me.data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (data) => setUser(prev => ({ ...prev, ...data }));

  const reloadUser = async () => {
    try {
      const res = await authAPI.me();
      setUser(res.data.user);
    } catch (e) {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, updateUser, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
