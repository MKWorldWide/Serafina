import React, { createContext, useContext, useState } from 'react';
import { IUser } from '../types/social';
import useStore from '../store/useStore';

interface IAuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<IUser> & { password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<IUser>) => Promise<void>;
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

const AuthContext = createContext<IAuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, setUser, logout: clearStore } = useStore();

  const login = async (email: string, password: string) => {
    console.log('Login attempt with:', { email, password });
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For testing, check if email contains "fail" to simulate a failed login
      if (email.includes('fail')) {
        throw new Error('Invalid credentials');
      }
      
      console.log('Login successful, setting user:', mockUser);
      setUser(mockUser);
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<IUser> & { password: string }) => {
    console.log('Register attempt with:', userData);
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        ...mockUser,
        ...userData,
        id: Math.random().toString(36).substr(2, 9),
      };
      
      console.log('Registration successful, setting user:', newUser);
      setUser(newUser);
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out');
    clearStore();
    setError(null);
  };

  const updateProfile = async (userData: Partial<IUser>) => {
    console.log('Updating profile:', userData);
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { ...user, ...userData };
        console.log('Profile update successful:', updatedUser);
        setUser(updatedUser);
      }
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
