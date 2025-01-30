import React, { createContext, useContext, useState, useCallback } from 'react';

interface User {
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    try {
      // Replace with actual API call
      const mockUser = {
        username: email.split('@')[0],
        email,
      };
      setUser(mockUser);
    } catch (error) {
      throw new Error('Login failed');
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    try {
      // Replace with actual API call
      const mockUser = {
        username,
        email,
      };
      setUser(mockUser);
    } catch (error) {
      throw new Error('Registration failed');
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
