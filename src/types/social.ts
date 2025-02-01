export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  rank?: string;
  level?: number;
}

export interface Post {
  id: string;
  content: string;
  richText: RichTextContent;
  author: User;
  createdAt: string;
  updatedAt: string;
  reactions: Reaction[];
  comments: Comment[];
  attachments: Attachment[];
  visibility: 'public' | 'friends' | 'private';
  tags: string[];
  metadata: {
    views: number;
    shares: number;
    score: number; // For algorithmic sorting
  };
}

export interface RichTextContent {
  blocks: Array<{
    id: string;
    type: 'paragraph' | 'heading' | 'list' | 'code' | 'image' | 'video';
    content: string;
    metadata?: Record<string, any>;
  }>;
  formatting: Array<{
    blockId: string;
    range: [number, number];
    style: 'bold' | 'italic' | 'link' | 'mention' | 'hashtag';
    data?: Record<string, any>;
  }>;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  reactions: Reaction[];
  replies: Comment[];
}

export interface Reaction {
  id: string;
  type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
  userId: string;
  createdAt: string;
}

export interface Attachment {
  url: string;
  type: 'image' | 'video' | 'link';
  description?: string;
}

export interface Notification {
  id: string;
  type: 'reaction' | 'comment' | 'reply' | 'mention' | 'follow' | 'system';
  recipient: User;
  actor: User;
  target: {
    type: 'post' | 'comment' | 'user';
    id: string;
  };
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface FeedItem {
  id: string;
  type: 'post' | 'shared' | 'activity';
  content: PostContent;
  author: User;
  createdAt: string;
  updatedAt: string;
  reactions: Reaction[];
  comments: Comment[];
  score: number;
  position: number;
  seen: boolean;
  promoted: boolean;
}

export interface PostContent {
  text: string;
  richText: any | null; // Replace with proper rich text type when implemented
  attachments: Attachment[];
}

export interface SharedContent extends Post {
  originalPost: Post;
  sharerComment?: string;
}

export interface ActivityContent {
  type: 'follow' | 'reaction' | 'achievement';
  actors: User[];
  target: Post | User;
  timestamp: string;
}

export interface FeedState {
  items: FeedItem[];
  lastFetched: string;
  hasMore: boolean;
  loading: boolean;
  error: Error | null;
  filters: {
    type: string[];
    timeRange: string;
    following: boolean;
  };
}

export interface WebSocketMessage {
  type: 'post' | 'comment' | 'reaction';
  action: 'create' | 'update' | 'delete';
  payload: any; // Type this properly based on the message type
}

export interface CacheConfig {
  key: string;
  ttl: number;
  version: string;
  dependencies: string[];
} 