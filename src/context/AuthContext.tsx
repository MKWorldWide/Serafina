import React, { createContext, useContext, ReactNode } from 'react';
import { IUser } from '../types/social';
import { useStore } from '../store/useStore';
import { Store } from '../types/store';

interface AuthContextType {
  isAuthenticated: boolean;
  user: Store['user'];
  login: Store['login'];
  logout: Store['logout'];
}

// Mock user for testing
const mockUser: IUser = {
  id: '1',
  username: 'TestUser',
  email: 'test@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser',
  presence: 'online',
  rank: 'Gold',
  level: 42
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, setUser, logout } = useStore((state: Store) => ({
    user: state.user,
    setUser: state.setUser,
    logout: state.logout,
  }));

  const value = {
    isAuthenticated: !!user,
    user,
    login: useStore.getState().login,
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

export default AuthContext;
