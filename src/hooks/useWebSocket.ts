import { useEffect, useCallback, useRef } from 'react';
import WebSocketService from '../services/websocket';
import { WebSocketMessage } from '../types/social';
import { useAuth } from '../context/AuthContext';

const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8080';

export function useWebSocket() {
  const { user } = useAuth();
  const wsService = useRef<WebSocketService>(WebSocketService.getInstance(WEBSOCKET_URL));
  const messageHandlers = useRef<Map<string, Set<(payload: any) => void>>>(new Map());

  useEffect(() => {
    if (user) {
      wsService.current.connect(user.id);

      return () => {
        wsService.current.disconnect();
      };
    }
  }, [user]);

  const subscribe = useCallback((
    type: WebSocketMessage['type'],
    handler: (payload: any) => void
  ) => {
    if (!messageHandlers.current.has(type)) {
      messageHandlers.current.set(type, new Set());
    }
    messageHandlers.current.get(type)?.add(handler);

    const unsubscribe = wsService.current.addMessageHandler((message) => {
      if (message.type === type) {
        handler(message.payload);
      }
    });

    return () => {
      messageHandlers.current.get(type)?.delete(handler);
      unsubscribe();
    };
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    wsService.current.send(message);
  }, []);

  const isConnected = useCallback(() => {
    return wsService.current.isConnected();
  }, []);

  // Convenience methods for common message types
  const sendMessage = useCallback((
    recipientId: string,
    content: string,
    attachments?: File[]
  ) => {
    send({
      type: 'message',
      action: 'create',
      payload: {
        recipientId,
        content,
        attachments,
      },
    });
  }, [send]);

  const sendTypingIndicator = useCallback((
    recipientId: string,
    isTyping: boolean
  ) => {
    send({
      type: 'typing',
      action: 'create',
      payload: {
        recipientId,
        isTyping,
      },
    });
  }, [send]);

  const updatePresence = useCallback((status: 'online' | 'away' | 'offline') => {
    send({
      type: 'presence',
      action: 'update',
      payload: {
        status,
      },
    });
  }, [send]);

  return {
    subscribe,
    send,
    isConnected,
    sendMessage,
    sendTypingIndicator,
    updatePresence,
  };
}

// Example usage:
/*
function ChatComponent() {
  const { subscribe, sendMessage, sendTypingIndicator } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe('message', (payload) => {
      // Handle new message
      console.log('New message:', payload);
    });

    return unsubscribe;
  }, [subscribe]);

  const handleSendMessage = (content: string) => {
    sendMessage('recipientId', content);
  };

  const handleTyping = (isTyping: boolean) => {
    sendTypingIndicator('recipientId', isTyping);
  };

  return (
    // Component JSX
  );
}
*/ 