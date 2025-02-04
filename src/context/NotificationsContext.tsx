import React, { createContext, useContext, useEffect, useState } from 'react';
import { websocketService, WebSocketMessage } from '../services/websocket';
import useStore from '../store/useStore';

interface INotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  sender?: {
    id: string;
    username: string;
    avatar: string;
  };
  read: boolean;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: INotification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const user = useStore(state => state.user);

  useEffect(() => {
    if (!user) return;

    // Connect to WebSocket
    websocketService.connect(localStorage.getItem('gamedin_token') || '');

    // Subscribe to notification types
    const unsubscribeHandlers = [
      websocketService.subscribe('NOTIFICATION_LIKE', handleNotification),
      websocketService.subscribe('NOTIFICATION_COMMENT', handleNotification),
      websocketService.subscribe('NOTIFICATION_FOLLOW', handleNotification),
      websocketService.subscribe('NOTIFICATION_MENTION', handleNotification),
      websocketService.subscribe('NOTIFICATION_TOURNAMENT', handleNotification),
      websocketService.subscribe('NOTIFICATION_TEAM', handleNotification),
      websocketService.subscribe('NOTIFICATION_ACHIEVEMENT', handleNotification),
      websocketService.subscribe('NOTIFICATION_SYSTEM', handleNotification),
    ];

    return () => {
      unsubscribeHandlers.forEach(unsubscribe => unsubscribe());
      websocketService.disconnect();
    };
  }, [user]);

  const handleNotification = (message: WebSocketMessage) => {
    const notification: INotification = {
      id: message.id,
      type: message.type,
      title: message.data.title || '',
      message: message.data.message,
      data: message.data,
      sender: message.data.sender,
      read: false,
      createdAt: message.timestamp,
    };

    setNotifications(prev => [notification, ...prev]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    );

    websocketService.send({
      type: 'MARK_NOTIFICATION_READ',
      data: {
        notificationId,
        message: 'Marking notification as read',
      },
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));

    websocketService.send({
      type: 'MARK_ALL_NOTIFICATIONS_READ',
      data: {
        message: 'Marking all notifications as read',
      },
    });
  };

  const clearAll = () => {
    setNotifications([]);

    websocketService.send({
      type: 'CLEAR_ALL_NOTIFICATIONS',
      data: {
        message: 'Clearing all notifications',
      },
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  };

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
