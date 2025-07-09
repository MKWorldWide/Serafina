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
  email: string;
  phone_number: string;
  name?: string;
  picture?: string;
  [key: string]: string | undefined;
}

export interface AuthContextType {
  user: AmplifyUser | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (username: string, password: string, email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
