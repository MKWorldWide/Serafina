export interface AmplifyUser {
  username: string;
  attributes: {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
    bio?: string;
    [key: string]: any;
  };
  getUsername(): string;
} 