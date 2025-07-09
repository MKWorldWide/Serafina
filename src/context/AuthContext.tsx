import React, { createContext, useContext } from 'react';
import { useStore } from '../store/useStore';
import { Store } from '../types/store';

const AuthContext = createContext<Store | null>(null);

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useStore(state => ({
    user: state.user,
    settings: state.settings,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    darkMode: state.darkMode,
    setUser: state.setUser,
    setIsAuthenticated: state.setIsAuthenticated,
    setLoading: state.setLoading,
    setError: state.setError,
    updateSettings: state.updateSettings,
    toggleDarkMode: state.toggleDarkMode,
    login: state.login,
    register: state.register,
    logout: state.logout,
    resetPassword: state.resetPassword,
    confirmResetPassword: state.confirmResetPassword,
    resendConfirmationCode: state.resendConfirmationCode,
  }));

  return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};
