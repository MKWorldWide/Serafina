import { IUser } from './social';

export interface ISettings {
  profileVisibility: 'public' | 'private';
  showOnlineStatus: boolean;
  showGameActivity: boolean;
  emailNotifications: {
    frequency: 'none' | 'real-time' | 'daily-digest' | 'weekly-digest';
    friendRequests: boolean;
    messages: boolean;
    gameInvites: boolean;
    achievements: boolean;
    newsAndUpdates: boolean;
  };
  emailDigestTime: string;
  theme: {
    mode: 'light' | 'dark';
    color: string;
  };
}

export interface IStoreState {
  user: IUser | null;
  isAuthenticated: boolean;
  settings: ISettings;
  loading: boolean;
  error: string | null;
}

export interface IStoreActions {
  setUser: (user: IUser | null) => void;
  updateSettings: (settings: Partial<ISettings>) => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

export type Store = IStoreState & IStoreActions; 