import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '../types/user';

interface ILoginCredentials {
  email: string;
  password: string;
}

interface IRegistrationData {
  username: string;
  email: string;
  password: string;
}

interface IAuthContextType {
  user: IUser | null;
  login: (credentials: ILoginCredentials) => Promise<void>;
  logout: () => void;
  register: (data: IRegistrationData) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const MOCK_USER: IUser = {
  id: '1',
  username: 'demo_user',
  email: 'demo@example.com',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_user',
  status: 'online',
  rank: 'Gold',
  level: 42,
};

const AuthContext = createContext<IAuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: ILoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      // Mock login - accept any credentials for demo
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      localStorage.setItem('auth_token', 'mock_token');
      setUser(MOCK_USER);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: IRegistrationData) => {
    try {
      setLoading(true);
      setError(null);

      // Mock registration - always succeed for demo
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      localStorage.setItem('auth_token', 'mock_token');
      setUser({
        ...MOCK_USER,
        username: data.username,
        email: data.email,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  useEffect(() => {
    // Check for stored auth token
    const checkAuth = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        if (token) {
          // For demo, just set the mock user if token exists
          setUser(MOCK_USER);
        }
      } catch (err) {
        setError('Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
