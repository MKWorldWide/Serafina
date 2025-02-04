import { IUser } from '../types/social';

export interface StoreState {
  user: IUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  setUser: (user: IUser | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
}

declare const useStore: <T = StoreState>(selector: (state: StoreState) => T) => T;
export default useStore; 