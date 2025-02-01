export type NotificationType = 
  | 'LIKE'
  | 'COMMENT'
  | 'FOLLOW'
  | 'MENTION'
  | 'TOURNAMENT_INVITE'
  | 'TEAM_INVITE'
  | 'ACHIEVEMENT'
  | 'SYSTEM';

export interface INotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  data?: {
    postId?: string;
    commentId?: string;
    userId?: string;
    tournamentId?: string;
    teamId?: string;
    achievementId?: string;
    [key: string]: any;
  };
  sender?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface INotificationState {
  notifications: INotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export interface INotificationActions {
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export interface INotificationPreferences {
  email: boolean;
  push: boolean;
  desktop: boolean;
  types: {
    [K in NotificationType]: boolean;
  };
  sounds: boolean;
  doNotDisturb: {
    enabled: boolean;
    from: string; // HH:mm format
    to: string; // HH:mm format
  };
}

export interface INotificationSound {
  id: string;
  name: string;
  url: string;
}

export type NotificationFilter = 'all' | 'unread' | NotificationType; 