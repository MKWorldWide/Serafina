import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Store } from '../types/store';
import { defaultSettings } from '../constants/settings';
import type { IUser } from '../types/social';

const useStore = create<Store>()(
  persist(
    (set) => ({
      user: null,
      settings: defaultSettings,
      darkMode: false,
      isAuthenticated: false,
      loading: false,
      error: null,

      setUser: (user) => set({ user }),
      updateSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setIsAuthenticated: (value) => set({ isAuthenticated: value }),
      setLoading: (value) => set({ loading: value }),
      setError: (error) => set({ error }),

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          // Implementation will be added later with AWS Amplify
          set({ loading: false, isAuthenticated: true });
        } catch (error) {
          set({ loading: false, error: 'Login failed' });
          throw error;
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          // Implementation will be added later with AWS Amplify
          set({ loading: false });
        } catch (error) {
          set({ loading: false, error: 'Registration failed' });
          throw error;
        }
      },

      resetPassword: async (email) => {
        set({ loading: true, error: null });
        try {
          // Implementation will be added later with AWS Amplify
          set({ loading: false });
        } catch (error) {
          set({ loading: false, error: 'Password reset failed' });
          throw error;
        }
      },

      confirmResetPassword: async (email, code, newPassword) => {
        set({ loading: true, error: null });
        try {
          // Implementation will be added later with AWS Amplify
          set({ loading: false });
        } catch (error) {
          set({ loading: false, error: 'Password reset confirmation failed' });
          throw error;
        }
      },

      resendConfirmationCode: async (email) => {
        set({ loading: true, error: null });
        try {
          // Implementation will be added later with AWS Amplify
          set({ loading: false });
        } catch (error) {
          set({ loading: false, error: 'Failed to resend confirmation code' });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          settings: defaultSettings
        });
      }
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        settings: state.settings
      })
    }
  )
);

export default useStore; 