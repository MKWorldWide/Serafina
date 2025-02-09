import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IStoreState, IStoreActions, Store } from '../types/store';

const initialSettings = {
  profileVisibility: 'public' as const,
  showOnlineStatus: true,
  showGameActivity: true,
  emailNotifications: {
    frequency: 'none' as const,
    friendRequests: true,
    messages: true,
    gameInvites: true,
    achievements: true,
    newsAndUpdates: false,
    security: false,
    teamInvites: false,
    matchmaking: false,
    marketing: false,
  },
  emailDigestTime: '09:00',
  theme: {
    mode: 'dark' as const,
    color: '#7289da',
  },
  pushNotifications: false,
  matchmakingEnabled: false,
  allowFriendRequests: true,
  allowMessages: true,
  darkMode: true,
  themeColor: '#7289da',
} as const;

export const useStore = create<Store>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      settings: initialSettings,
      loading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      updateSettings: (newSettings) => 
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        })),

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          // Mock login - replace with actual API call
          const mockUser = {
            id: '1',
            username: 'TestUser',
            email: credentials.email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`,
            bio: 'Gamer extraordinaire',
            presence: 'online' as const,
            rank: 'Beginner',
            level: 1
          };
          set({ user: mockUser, isAuthenticated: true, loading: false });
        } catch (error) {
          set({ error: 'Login failed', loading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'gamedin-storage',
      partialize: (state) => ({
        user: state.user,
        settings: state.settings,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 