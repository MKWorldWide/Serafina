export type MessageType = 'text' | 'image' | 'video' | 'file' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type ConversationType = 'PRIVATE' | 'GROUP';
export type ParticipantRole = 'ADMIN' | 'MEMBER';
export type UserPresence = 'online' | 'offline' | 'away' | 'busy';

export interface IUser {
  id: string;
  email: string;
  username: string;
  name: string;
  picture?: string;
  avatar: string;
  bio: string;
  level: number;
  rank: string;
  status: UserPresence;
  lastSeen: Date;
  friends: IFriend[];
  gameStats: {
    gamesPlayed: number;
    gamesWon: number;
    winRate: number;
    achievements: string[];
  };
  settings: {
    profileVisibility: 'public' | 'friends' | 'private';
    notifications: {
      push: boolean;
      email: boolean;
      emailNotifications: {
        frequency: 'daily' | 'weekly' | 'real-time';
        types: {
          friendRequests: boolean;
          messages: boolean;
          gameInvites: boolean;
          achievements: boolean;
        };
      };
    };
    privacy: {
      showOnlineStatus: boolean;
      showLastSeen: boolean;
      allowFriendRequests: boolean;
      showGameStats: boolean;
    };
  };
  attributes?: Record<string, string | undefined>;
}

export interface IFriend extends IUser {
  friendshipStatus: 'pending' | 'accepted' | 'blocked';
  friendSince: string;
}

export interface IUserProfile {
  user: IUser;
  isCurrentUser: boolean;
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

export interface IMessage {
  id: string;
  conversationId: string;
  content: string;
  type: MessageType;
  author: IUser;
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
  attachments?: IAttachment[];
  metadata?: {
    replyTo?: string;
    mentions?: string[];
    links?: string[];
    reactions?: IReaction[];
  };
}

export interface IAttachment {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  name: string;
  size: number;
  mimeType: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    thumbnail?: string;
  };
}

export interface IReaction {
  id: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface IConversationParticipant {
  id: string;
  user: IUser;
  role: ParticipantRole;
  joinedAt: Date;
  lastRead?: Date;
  isTyping: boolean;
  isMuted: boolean;
}

export interface IConversation {
  id: string;
  type: ConversationType;
  title?: string;
  description?: string;
  groupAvatar?: string;
  participants: IConversationParticipant[];
  lastMessage?: IMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    theme?: string;
    pinnedMessages?: string[];
    customEmoji?: Record<string, string>;
  };
}

export interface IMessageInput {
  content: string;
  recipientId: string;
  attachments?: File[];
  metadata?: {
    replyTo?: string;
    mentions?: string[];
  };
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

export interface Post {
  id: string;
  content: string;
  author: IUser;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

export interface IPaginatedResponse<T> {
  items: T[];
  nextToken?: string;
  hasMore: boolean;
}

export interface IWebSocketMessage<T = unknown> {
  type: 'MESSAGE' | 'TYPING' | 'PRESENCE' | 'REACTION';
  payload: T;
  timestamp: Date;
}

export interface ITypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface IPresenceUpdate {
  userId: string;
  status: UserPresence;
  lastSeen: Date;
}

export interface IChatError extends Error {
  code: string;
  details?: Record<string, unknown>;
  retry?: boolean;
}
