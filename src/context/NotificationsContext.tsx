import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { INotification, INotificationState, INotificationActions } from '../types/notifications';
import { websocketService } from '../services/websocket';
import { WebSocketMessage } from '../types/social';

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
        unreadCount: Math.max(0, state.unreadCount - 1),
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

  // Initialize WebSocket connection
  useEffect(() => {
    websocketService.connect();

    // Subscribe to different notification types
    const unsubscribeCallbacks = [
      websocketService.subscribe('NOTIFICATION_LIKE', handleNotification),
      websocketService.subscribe('NOTIFICATION_COMMENT', handleNotification),
      websocketService.subscribe('NOTIFICATION_FOLLOW', handleNotification),
      websocketService.subscribe('NOTIFICATION_MENTION', handleNotification),
      websocketService.subscribe('NOTIFICATION_TOURNAMENT', handleNotification),
      websocketService.subscribe('NOTIFICATION_TEAM', handleNotification),
      websocketService.subscribe('NOTIFICATION_ACHIEVEMENT', handleNotification),
      websocketService.subscribe('NOTIFICATION_SYSTEM', handleNotification),
    ];

    // Cleanup subscriptions
    return () => {
      unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
      websocketService.disconnect();
    };
  }, []);

  const handleNotification = useCallback((message: WebSocketMessage) => {
    if (message.type.startsWith('NOTIFICATION_')) {
      const notification: INotification = {
        id: message.id,
        type: message.type.replace('NOTIFICATION_', '') as any,
        title: message.data.title,
        message: message.data.message,
        createdAt: new Date().toISOString(),
        read: false,
        data: message.data,
        sender: message.data.sender,
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

      // Show browser notification if supported
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: notification.sender?.avatarUrl,
        });
      }
    }
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Send WebSocket message to mark as read
      websocketService.send({
        type: 'MARK_NOTIFICATION_READ',
        id: notificationId,
        data: { notificationId },
      });
      dispatch({ type: 'MARK_AS_READ', payload: notificationId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark notification as read' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Send WebSocket message to mark all as read
      websocketService.send({
        type: 'MARK_ALL_NOTIFICATIONS_READ',
        id: Date.now().toString(),
        data: {},
      });
      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark all notifications as read' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Send WebSocket message to delete notification
      websocketService.send({
        type: 'DELETE_NOTIFICATION',
        id: notificationId,
        data: { notificationId },
      });
      dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete notification' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Send WebSocket message to clear all notifications
      websocketService.send({
        type: 'CLEAR_ALL_NOTIFICATIONS',
        id: Date.now().toString(),
        data: {},
      });
      dispatch({ type: 'CLEAR_ALL' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear notifications' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
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