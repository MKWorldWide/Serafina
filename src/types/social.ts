export interface IUser {
  id: string;
  username: string;
  email?: string;
  name?: string;
  picture?: string;
  bio?: string;
  rank?: string;
  level?: number;
  presence?: 'online' | 'offline' | 'away';
  createdAt: string;
  updatedAt: string;
}

export interface IUserProfile {
  name?: string;
  bio?: string;
  picture?: string;
}

export interface IPost {
  id: string;
  content: string;
  author: IUser;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

export interface IComment {
  id: string;
  content: string;
  author: IUser;
  postId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IConversation {
  id: string;
  title?: string;
  description?: string;
  type: 'PRIVATE' | 'GROUP';
  participants: {
    user: IUser;
    role: 'ADMIN' | 'MEMBER';
  }[];
  lastMessage?: IMessage;
  createdAt: string;
  updatedAt: string;
}

export interface IMessage {
  id: string;
  conversationId: string;
  content: string;
  author: IUser;
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  id: string;
  type: 'MESSAGE' | 'FRIEND_REQUEST' | 'ACHIEVEMENT' | 'SYSTEM';
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  data?: {
    conversationId?: string;
    userId?: string;
    achievementId?: string;
    post?: IPost;
  };
} 