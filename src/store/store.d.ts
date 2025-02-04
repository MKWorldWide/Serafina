import { IUser } from '../types/social';

export interface StoreState {
  user: IUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

declare module '../store/useStore' {
  export default function useStore<T>(selector: (state: StoreState) => T): T;
} 