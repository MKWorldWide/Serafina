import { create } from 'zustand';
import { Auth } from '@aws-amplify/auth';
import { persist } from 'zustand/middleware';
import type { Store } from '../types/store';
import { defaultSettings } from '../constants/settings';
import type { IUser } from '../types/social';
import { LoginCredentials, RegisterData } from '../types/store';
import { userMapper } from '../utils/userMapper';

export const useStore = create<Store>((set, get) => ({
  user: null,
  settings: defaultSettings,
  isAuthenticated: false,
  loading: false,
  error: null,
  darkMode: false,

  setUser: (user: IUser | null) => set({ user }),
  setIsAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
  setLoading: (value: boolean) => set({ loading: value }),
  setError: (error: string | null) => set({ error }),
  updateSettings: (newSettings: Partial<ISettings>) =>
    set(state => ({
      settings: { ...state.settings, ...newSettings },
    })),
  toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),

  login: async (credentials: LoginCredentials) => {
    const { setLoading, setError, setUser, setIsAuthenticated } = get();
    try {
      setLoading(true);
      setError(null);
      const cognitoUser = await Auth.signIn(credentials.email, credentials.password);
      const mappedUser = userMapper(cognitoUser);
      setUser(mappedUser);
      setIsAuthenticated(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during login');
      throw error;
    } finally {
      setLoading(false);
    }
  },

  register: async (userData: RegisterData) => {
    const { setLoading, setError } = get();
    try {
      setLoading(true);
      setError(null);
      await Auth.signUp({
        username: userData.email,
        password: userData.password,
        attributes: {
          email: userData.email,
          name: userData.username,
        },
      });
      return Promise.resolve();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during registration');
      throw error;
    } finally {
      setLoading(false);
    }
  },

  logout: async () => {
    const { setLoading, setError, setUser, setIsAuthenticated } = get();
    try {
      setLoading(true);
      setError(null);
      await Auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during logout');
      throw error;
    } finally {
      setLoading(false);
    }
  },

  resetPassword: async (email: string) => {
    const { setLoading, setError } = get();
    try {
      setLoading(true);
      setError(null);
      await Auth.forgotPassword(email);
      return Promise.resolve();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during password reset');
      throw error;
    } finally {
      setLoading(false);
    }
  },

  confirmResetPassword: async (email: string, code: string, newPassword: string) => {
    const { setLoading, setError } = get();
    try {
      setLoading(true);
      setError(null);
      await Auth.forgotPasswordSubmit(email, code, newPassword);
      return Promise.resolve();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'An error occurred during password reset confirmation',
      );
      throw error;
    } finally {
      setLoading(false);
    }
  },

  resendConfirmationCode: async (email: string) => {
    const { setLoading, setError } = get();
    try {
      setLoading(true);
      setError(null);
      await Auth.resendSignUp(email);
      return Promise.resolve();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'An error occurred when resending confirmation code',
      );
      throw error;
    } finally {
      setLoading(false);
    }
  },
}));

export default useStore;
