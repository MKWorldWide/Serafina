import { CognitoUser } from '@aws-amplify/auth';
import type { IUser } from '../types/social';

interface CognitoAttributes {
  email?: string;
  name?: string;
  picture?: string;
  rank?: string;
  level?: string;
  [key: string]: string | undefined;
}

interface ExtendedCognitoUser extends Omit<CognitoUser, 'attributes'> {
  attributes?: CognitoAttributes;
  getUsername(): string;
}

export function mapCognitoUserToIUser(cognitoUser: ExtendedCognitoUser): IUser {
  const username = cognitoUser.getUsername();
  const attributes = cognitoUser.attributes || {};
  
  return {
    id: username,
    username,
    email: attributes.email,
    name: attributes.name,
    picture: attributes.picture || '/default-avatar.png',
    rank: attributes.rank || 'Beginner',
    level: attributes.level ? parseInt(attributes.level, 10) : 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}