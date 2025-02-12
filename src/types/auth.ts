export interface AmplifyUser {
  id: string;
  username: string;
  attributes: {
    email?: string;
    name?: string;
    picture?: string;
    bio?: string;
    sub: string;
    [key: string]: any;
  };
} 