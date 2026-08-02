import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('okgip_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('okgip_token');
  });

  const [loading, setLoading] = useState<boolean>(true);

  const loginHandler = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('okgip_token', newToken);
    localStorage.setItem('okgip_user', JSON.stringify(newUser));
  };

  const logoutHandler = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('okgip_token');
    localStorage.removeItem('okgip_user');
  };

  const refreshUser = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('okgip_user', JSON.stringify(res.data.user));
      }
    } catch (error) {
      console.error('Failed to verify session token:', error);
      logoutHandler();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: loginHandler,
        logout: logoutHandler,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
