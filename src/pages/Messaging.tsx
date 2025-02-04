import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import useStore from '../store/useStore';
import { IConversation, IMessage, IUser } from '../types/social';
import ConversationsList from '../components/messaging/ConversationsList';
import MessageList from '../components/messaging/MessageList';
import MessageInput from '../components/messaging/MessageInput';
import GroupChatDialog from '../components/messaging/GroupChatDialog';

interface ExtendedConversation extends IConversation {
  name: string;
}

const Messaging: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [conversations, setConversations] = useState<ExtendedConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ExtendedConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useStore(state => state.user);
  const { subscribe, send } = useWebSocket();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/conversations');
        const data = await response.json();
        setConversations(data.conversations);
        setError(null);
      } catch (err) {
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/conversations/${conversationId}/messages`);
        const data = await response.json();
        setMessages(data.messages);
        setError(null);
      } catch (err) {
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
      fetchMessages();
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    const unsubscribeMessage = subscribe('MESSAGE_CREATE', message => {
      if (message.data.message && message.data.message.conversation.id === selectedConversation?.id) {
        setMessages(prev => [...prev, message.data.message!]);
      }
    });

    const unsubscribeMessageUpdate = subscribe('MESSAGE_UPDATE', message => {
      if (message.data.message && message.data.message.conversation.id === selectedConversation?.id) {
        setMessages(prev =>
          prev.map(m =>
            m.id === message.data.message!.id ? { ...m, ...message.data.message } : m
          )
        );
      }
    });

    const unsubscribeMessageDelete = subscribe('MESSAGE_DELETE', message => {
      if (message.data.messageId && selectedConversation?.id) {
        setMessages(prev => prev.filter(m => m.id !== message.data.messageId));
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeMessageUpdate();
      unsubscribeMessageDelete();
    };
  }, [selectedConversation?.id, subscribe]);

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !user || !content.trim()) return;

    try {
      const message: IMessage = {
        id: crypto.randomUUID(),
        content: content.trim(),
        sender: user,
        conversation: selectedConversation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update
      setMessages(prev => [...prev, message]);

      send('MESSAGE_CREATE', { message });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleCreateGroup = async (name: string, participants: IUser[], admins: IUser[]) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          participants: participants.map(p => p.id),
          admins: admins.map(a => a.id),
        }),
      });

      const newConversation = await response.json();
      setConversations(prev => [...prev, newConversation]);
      setSelectedConversation(newConversation);
      setIsGroupDialogOpen(false);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleUpdateGroup = async (
    name: string,
    addedUsers: IUser[],
    removedUsers: IUser[],
    addedAdmins: IUser[],
    removedAdmins: IUser[]
  ) => {
    if (!selectedConversation) return;

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          addedUsers: addedUsers.map(u => u.id),
          removedUsers: removedUsers.map(u => u.id),
          addedAdmins: addedAdmins.map(u => u.id),
          removedAdmins: removedAdmins.map(u => u.id),
        }),
      });

      const updatedConversation = await response.json();
      setConversations(prev =>
        prev.map(c => (c.id === updatedConversation.id ? updatedConversation : c))
      );
      setSelectedConversation(updatedConversation);
      setIsGroupDialogOpen(false);
    } catch (error) {
      console.error('Failed to update group:', error);
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      const updatedMessage = await response.json();
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? updatedMessage : m))
      );
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleReplyMessage = (message: IMessage) => {
    // Implement reply functionality
    console.log('Reply to message:', message);
  };

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="w-80 border-r border-base-300">
        <div className="p-4 border-b border-base-300">
          <button
            className="btn btn-primary w-full"
            onClick={() => setIsGroupDialogOpen(true)}
          >
            New Group Chat
          </button>
        </div>
        <ConversationsList
          conversations={conversations}
          activeConversationId={selectedConversation?.id}
          onSelectConversation={setSelectedConversation}
        />
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-base-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full">
                      <img
                        src={selectedConversation.participants[0].user.avatar}
                        alt={selectedConversation.participants[0].user.username}
                      />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedConversation.name || selectedConversation.participants[0].user.username}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            <MessageList
              messages={messages}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
              onReply={handleReplyMessage}
            />

            <div className="p-4 border-t border-base-300">
              <MessageInput onSubmit={handleSendMessage} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-base-content/60">
            Select a conversation to start messaging
          </div>
        )}
      </div>

      <GroupChatDialog
        isOpen={isGroupDialogOpen}
        onClose={() => setIsGroupDialogOpen(false)}
        onSubmit={handleCreateGroup}
        existingGroup={selectedConversation}
        onUpdateGroup={handleUpdateGroup}
      />
    </div>
  );
};

export default Messaging;
