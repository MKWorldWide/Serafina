import { CognitoUser } from '@aws-amplify/auth';
import { IUser } from '../types/social';
import { defaultSettings } from '../constants/settings';

export const userMapper = (cognitoUser: CognitoUser): IUser => {
  const attributes = cognitoUser.attributes || {};
  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${attributes.preferred_username || attributes.email || cognitoUser.username}`;

  // Ensure required string fields have default values
  const email = attributes.email || cognitoUser.username;
  const username = attributes.preferred_username || email.split('@')[0] || cognitoUser.username;
  const name = attributes.name || username;

  return {
    id: cognitoUser.username,
    email,
    username,
    name,
    picture: attributes.picture || defaultAvatar,
    avatar: attributes.picture || defaultAvatar,
    bio: attributes['custom:bio'] || '',
    rank: attributes['custom:rank'] || 'Rookie',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attributes: {
      email: attributes.email,
      name: attributes.name,
      picture: attributes.picture,
      rank: attributes['custom:rank'] || 'Rookie',
    },
  };
};
