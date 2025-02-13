import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IUser } from '../types/social';

interface Settings {
  theme: 'light' | 'dark';
  notifications: boolean;
  privacy: 'public' | 'private';
  language: string;
  timezone: string;
}

interface Store {
  darkMode: boolean;
  toggleDarkMode: () => void;
  user: IUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  settings: Settings;
  setUser: (user: IUser | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const initialSettings: Settings = {
  theme: 'light',
  notifications: true,
  privacy: 'public',
  language: 'en',
  timezone: 'UTC',
};

const useStore = create<Store>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ ...state, darkMode: !state.darkMode })),
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      settings: initialSettings,

      setUser: (user) => set((state) => ({ ...state, user })),
      setIsAuthenticated: (isAuthenticated) => set((state) => ({ ...state, isAuthenticated })),
      setLoading: (loading) => set((state) => ({ ...state, loading })),
      setError: (error) => set((state) => ({ ...state, error })),
      
      updateSettings: (newSettings) =>
        set((state) => ({
          ...state,
          settings: { ...state.settings, ...newSettings },
        })),

      login: async (credentials) => {
        set((state) => ({ ...state, loading: true, error: null }));
        try {
          const mockUser: IUser = {
            id: '1',
            username: credentials.email.split('@')[0],
            email: credentials.email,
            name: 'Test User',
            picture: '/default-avatar.png',
            rank: 'Beginner',
            level: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          set((state) => ({ ...state, user: mockUser, isAuthenticated: true }));
        } catch (error) {
          set((state) => ({ 
            ...state, 
            error: error instanceof Error ? error.message : 'Login failed' 
          }));
          throw error;
        } finally {
          set((state) => ({ ...state, loading: false }));
        }
      },

      logout: () => {
        set((state) => ({
          ...state,
          user: null,
          isAuthenticated: false,
          error: null,
        }));
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        settings: state.settings
      })
    }
  )
);

export default useStore; 