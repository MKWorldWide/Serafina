import { useAuth } from '../context/AuthContext';
import { mapAmplifyUserToIUser } from '../utils/userMapper';
import { IUser } from '../types/social';

export function useUser(): { user: IUser | null; isAuthenticated: boolean } {
  const { user: amplifyUser, isAuthenticated } = useAuth();
  const user = mapAmplifyUserToIUser(amplifyUser);

  return { user, isAuthenticated };
} 