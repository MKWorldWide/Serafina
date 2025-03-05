import React, { createContext, useContext, ReactNode } from 'react';
import { AmplifyUser } from '@aws-amplify/ui';
import store from '../store/useStore';
import { Store, ISettings } from '../types/store';
import { IUser } from '../types/social';

interface AuthContextType {
  isAuthenticated: boolean;
  user: IUser | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  settings: ISettings;
  updateSettings: (settings: Partial<ISettings>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { 
    user, 
    setUser, 
    logout, 
    loading, 
    error, 
    login,
    setLoading,
    setError,
    darkMode,
    toggleDarkMode,
    isAuthenticated,
    settings,
    setIsAuthenticated,
    updateSettings
  } = store<Store>(state => ({
    user: state.user,
    setUser: state.setUser,
    logout: state.logout,
    loading: state.loading,
    error: state.error,
    login: state.login,
    setLoading: state.setLoading,
    setError: state.setError,
    darkMode: state.darkMode,
    toggleDarkMode: state.toggleDarkMode,
    isAuthenticated: state.isAuthenticated,
    settings: state.settings,
    setIsAuthenticated: state.setIsAuthenticated,
    updateSettings: state.updateSettings
  }));

  const value = {
    isAuthenticated: !!user,
    user: user as IUser | null,
    login,
    logout,
    loading,
    error,
    settings,
    updateSettings
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
