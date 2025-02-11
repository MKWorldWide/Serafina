import { AmplifyUser } from '@aws-amplify/ui';
import { IUser } from '../types/social';

export function mapAmplifyUserToIUser(amplifyUser: AmplifyUser | undefined | null): IUser | null {
  if (!amplifyUser || !amplifyUser.username) return null;

  return {
    id: amplifyUser.username,
    username: amplifyUser.username,
    email: amplifyUser.attributes?.email || '',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${amplifyUser.username}`,
    presence: 'online',
    rank: 'Beginner',
    level: 1
  };
} 