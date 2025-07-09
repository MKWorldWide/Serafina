import { AuthUser } from '@aws-amplify/auth';

export interface AmplifyUser {
  username: string;
  attributes?: {
    email?: string;
    name?: string;
    picture?: string;
    sub?: string;
    [key: string]: any;
  };
}

export interface CognitoAttributes {
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  name?: string;
  picture?: string;
  sub?: string;
  [key: string]: string | boolean | undefined;
}

export interface IAuthUser extends AuthUser {
  attributes: CognitoAttributes;
}

export interface AuthContextType {
  user: IAuthUser | null;
  loading: boolean;
  error: string | null;
  setUser: (user: IAuthUser | null) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (username: string, password: string, email: string) => Promise<void>;
  isLoading: boolean;
}
