export interface User {
  id: string;
  username: string;
  name?: string;
  email: string;
  avatar: string;
  bio?: string;
  followers: number;
  following: number;
  presence?: 'online' | 'offline' | 'away';
  rank?: string;
  level?: number;
}

export interface PostContent {
  text: string;
  media?: {
    type: 'image' | 'video';
    url: string;
  }[];
}

export type PostPrivacy = 'public' | 'friends' | 'private';

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  likes: number;
  replies: Comment[];
}

export interface Post {
  id: string;
  content: PostContent;
  author: User;
  createdAt: string;
  privacy: PostPrivacy;
  likes: number;
  comments: Comment[];
  shares: number;
  game?: {
    id: string;
    name: string;
    cover: string;
  };
  edited?: boolean;
}

export interface IMessage {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
  conversationId: string;
  read: boolean;
  sender: {
    id: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
}

export interface IConversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: IMessage;
  participants: User[];
  isGroup: boolean;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameActivity {
  id: string;
  user: User;
  game: {
    id: string;
    name: string;
    cover: string;
  };
  type: 'achievement' | 'playtime' | 'score';
  data: {
    achievement?: {
      name: string;
      description: string;
      icon: string;
    };
    playtime?: number;
    score?: number;
  };
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'mention' | 'achievement';
  user: User;
  data: {
    post?: Post;
    comment?: Comment;
    achievement?: {
      name: string;
      description: string;
      icon: string;
    };
  };
  read: boolean;
  createdAt: string;
}

export interface IAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  progress?: {
    current: number;
    required: number;
  };
  game?: string;
  unlockedAt?: string;
}

export interface INotification {
  id: string;
  title: string;
  description: string;
  type: 'friend_request' | 'message' | 'achievement' | 'system';
  timestamp: string;
  read: boolean;
  metadata?: {
    userId?: string;
    gameId?: string;
    achievementId?: string;
  };
}

export interface FeedItem {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  liked: boolean;
  media?: {
    type: 'image' | 'video';
    url: string;
  }[];
  author: {
    id: string;
    username: string;
    avatar: string;
  };
}

export interface WebSocketMessage {
  type: 'ACTIVITY_CREATE' | 'ACTIVITY_UPDATE' | 'ACTIVITY_DELETE' | 'MESSAGE_CREATE' | 'MESSAGE_UPDATE' | 'MESSAGE_DELETE';
  data: {
    message?: IMessage;
    messageId?: string;
  };
  timestamp: string;
} 