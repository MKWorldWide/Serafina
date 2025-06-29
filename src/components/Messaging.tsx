import { Box, Typography, Grid } from '@mui/material';
import { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { useWebSocket } from '../hooks/useWebSocket';
import { IMessage, IConversation, WebSocketMessage } from '../types/social';
import ConversationsList from './messaging/ConversationsList';
import MessageList from './messaging/MessageList';
import MessageInput from './messaging/MessageInput';

export const Messaging = () => {
  const { user } = useUser();
  const { subscribe, send } = useWebSocket();
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    if (!user) return;

    const handleWebSocketMessage = (event: WebSocketMessage) => {
      if (event.type === 'MESSAGE_CREATE' && event.data.message) {
        const { message } = event.data;
        if (message.conversationId === selectedConversation?.id) {
          setMessages((prev) => [...prev, message]);
        }
      }
    };

    const unsubscribe = subscribe(handleWebSocketMessage);
    return () => unsubscribe();
  }, [user, selectedConversation, subscribe]);

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !user) return;

    const newMessage: IMessage = {
      id: Date.now().toString(),
      content,
      userId: user.username,
      userName: user.username,
      userAvatar: user.attributes?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
      timestamp: new Date().toISOString(),
      conversationId: selectedConversation.id,
      read: false,
      sender: {
        id: user.username,
        username: user.username,
        avatar: user.attributes?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
      },
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newMessage]);
    send({
      type: 'MESSAGE_CREATE',
      data: {
        message: newMessage
      },
      timestamp: new Date().toISOString()
    });
  };

  if (!user) {
    return (
      <Box p={4}>
        <Typography>Please sign in to access messaging</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <ConversationsList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          {selectedConversation ? (
            <>
              <MessageList messages={messages} user={user} />
              <MessageInput onSubmit={handleSendMessage} />
            </>
          ) : (
            <Box p={4} textAlign="center">
              <Typography color="textSecondary">
                Select a conversation to start messaging
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Messaging; 