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
  type: 'post' | 'comment' | 'reaction' | 'message' | 'notification' | 'presence' | 'typing' | 'ping';
  action: 'create' | 'update' | 'delete';
  payload: any; // Type this properly based on the message type
}

export interface CacheConfig {
  key: string;
  ttl: number;
  version: string;
  dependencies: string[];
}

export interface IMessage {
  id: string;
  content: string;
  sender: User;
  recipient: User;
  createdAt: string;
  updatedAt?: string;
  readAt?: string;
  deletedAt?: string;
  editHistory?: {
    content: string;
    editedAt: string;
  }[];
  attachments?: Attachment[];
  replyTo?: IMessage;
  reactions?: Reaction[];
  type: 'text' | 'file' | 'image' | 'video' | 'system';
  metadata?: {
    isEdited: boolean;
    isDeleted: boolean;
    deliveredAt?: string;
    readAt?: string;
  };
}

export interface IConversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
  participants: IConversationParticipant[];
  lastMessage?: IMessage;
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
  metadata?: {
    isArchived: boolean;
    isMuted: boolean;
    isPinned: boolean;
    theme?: string;
    customEmoji?: string[];
  };
}

export interface IConversationParticipant {
  user: User;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  lastSeen?: string;
  isOnline: boolean;
  typing?: boolean;
  status?: 'active' | 'inactive' | 'blocked' | 'left';
}

export interface IMessageInput {
  content: string;
  recipientId: string;
  attachments?: File[];
  replyToMessageId?: string;
  metadata?: Record<string, any>;
}

export interface ITeam {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  banner?: string;
  owner: User;
  members: ITeamMember[];
  games: string[];
  stats: {
    wins: number;
    losses: number;
    draws: number;
    ranking?: number;
    elo?: number;
  };
  createdAt: string;
  updatedAt: string;
  metadata?: {
    isVerified: boolean;
    region: string;
    timezone: string;
    languages: string[];
    recruitment: {
      isOpen: boolean;
      positions: string[];
      requirements?: string[];
    };
  };
}

export interface ITeamMember {
  user: User;
  role: 'owner' | 'captain' | 'manager' | 'player' | 'substitute';
  joinedAt: string;
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
  stats?: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    performance: number;
  };
}

export interface ITournament {
  id: string;
  name: string;
  description: string;
  game: string;
  format: 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss';
  status: 'upcoming' | 'registration' | 'in-progress' | 'completed';
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeams: number;
  registeredTeams: ITeam[];
  brackets: ITournamentBracket[];
  prizes: ITournamentPrize[];
  rules: string[];
  organizer: User;
  moderators: User[];
  metadata?: {
    region: string;
    timezone: string;
    streamUrl?: string;
    discord?: string;
    sponsors?: {
      name: string;
      logo: string;
      website: string;
    }[];
  };
}

export interface ITournamentBracket {
  id: string;
  round: number;
  matches: ITournamentMatch[];
}

export interface ITournamentMatch {
  id: string;
  team1: ITeam;
  team2: ITeam;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  scheduledTime: string;
  result?: {
    winner: string;
    score: {
      team1: number;
      team2: number;
    };
    stats?: Record<string, any>;
  };
  metadata?: {
    streamUrl?: string;
    referee?: User;
    notes?: string;
  };
}

export interface ITournamentPrize {
  position: number;
  reward: {
    type: 'cash' | 'item' | 'points';
    amount: number;
    currency?: string;
    description: string;
  };
} 