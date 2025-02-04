import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '../types/social';

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
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('gamedin_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setError(null);
        } else {
          localStorage.removeItem('gamedin_token');
          setUser(null);
          setError('Session expired');
        }
      } catch (err) {
        setError('Failed to check authentication');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('gamedin_token', data.token);
        setUser(data.user);
        setError(null);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<IUser> & { password: string }) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('gamedin_token', data.token);
        setUser(data.user);
        setError(null);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('gamedin_token');
    setUser(null);
  };

  const updateProfile = async (userData: Partial<IUser>) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('gamedin_token')}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setError(null);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
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
