import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { INotification, INotificationState, INotificationActions } from '../types/notifications';

interface NotificationsContextValue extends INotificationState, INotificationActions {}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

type NotificationAction =
  | { type: 'SET_NOTIFICATIONS'; payload: INotification[] }
  | { type: 'ADD_NOTIFICATION'; payload: INotification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: INotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationsReducer = (
  state: INotificationState,
  action: NotificationAction
): INotificationState => {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter((n) => !n.read).length,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: state.unreadCount - 1,
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      };
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
        unreadCount: state.notifications.filter(
          (n) => !n.read && n.id !== action.payload
        ).length,
      };
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(notificationsReducer, initialState);

  // Mock WebSocket connection for real-time updates
  useEffect(() => {
    // TODO: Replace with actual WebSocket connection
    const mockWebSocket = {
      onmessage: (callback: (data: INotification) => void) => {
        // Simulate receiving notifications
        const interval = setInterval(() => {
          const mockNotification: INotification = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'LIKE',
            title: 'New Like',
            message: 'Someone liked your post',
            createdAt: new Date().toISOString(),
            read: false,
            sender: {
              id: '1',
              username: 'user1',
              avatarUrl: 'https://mui.com/static/images/avatar/1.jpg',
            },
          };
          callback(mockNotification);
        }, 30000); // Every 30 seconds

        return () => clearInterval(interval);
      },
    };

    const unsubscribe = mockWebSocket.onmessage((notification) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // TODO: Implement API call
      dispatch({ type: 'MARK_AS_READ', payload: notificationId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark notification as read' });
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      // TODO: Implement API call
      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark all notifications as read' });
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      // TODO: Implement API call
      dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete notification' });
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      // TODO: Implement API call
      dispatch({ type: 'CLEAR_ALL' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear notifications' });
    }
  }, []);

  const value = {
    ...state,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}; 