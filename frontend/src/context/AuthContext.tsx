import React, { createContext, useContext, ReactNode } from 'react';
import { AmplifyUser } from '@aws-amplify/ui';
import store from '../store/useStore';
import { Store } from '../types/store';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AmplifyUser | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: Partial<AmplifyUser> & { password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
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
    register,
    resetPassword,
    confirmResetPassword,
    resendConfirmationCode,
    setLoading,
    setError,
    darkMode,
    toggleDarkMode
  } = store<Store>(state => ({
    user: state.user,
    setUser: state.setUser,
    logout: state.logout,
    loading: state.loading,
    error: state.error,
    login: state.login,
    register: state.register,
    resetPassword: state.resetPassword,
    confirmResetPassword: state.confirmResetPassword,
    resendConfirmationCode: state.resendConfirmationCode,
    setLoading: state.setLoading,
    setError: state.setError,
    darkMode: state.darkMode,
    toggleDarkMode: state.toggleDarkMode
  }));

  const value = {
    isAuthenticated: !!user,
    user: user as AmplifyUser | null,
    login,
    register,
    logout,
    loading,
    error,
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
