export interface AmplifyUser {
  id: string;
  username: string;
  attributes?: {
    email: string;
    name?: string;
    picture?: string;
    sub: string;
    [key: string]: any;
  };
} 