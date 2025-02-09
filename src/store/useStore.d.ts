import { IUser } from '../types/social';
import { Store, ISettings } from '../types/store';

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

declare const useStore: <T = Store>(selector: (state: Store) => T) => T;
export default useStore; 