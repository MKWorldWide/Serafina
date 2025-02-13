import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import type { IConversation, IMessage, IUser } from '../types/social';

export default function Messaging() {
  const user = useStore((state) => state.user);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // TODO: Fetch conversations from API
    const mockConversations: IConversation[] = [
      {
        id: '1',
        type: 'PRIVATE',
        participants: [
          {
            user: {
              id: '2',
              username: 'jane',
              name: 'Jane Doe',
              picture: '/default-avatar.png',
              rank: 'Intermediate',
              level: 2,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            role: 'MEMBER'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    setConversations(mockConversations);
  }, []);

  const handleSendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    const message: IMessage = {
      id: Date.now().toString(),
      conversationId: selectedConversation.id,
      content: newMessage.trim(),
      author: {
        id: user.id,
        username: user.username,
        name: user.name || '',
        picture: user.picture || '/default-avatar.png',
        rank: user.rank || 'Beginner',
        level: user.level || 1,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // TODO: Send message to API
    console.log('Sending message:', message);
    setNewMessage('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Please log in to access messages.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-12 min-h-[600px]">
          {/* Conversations List */}
          <div className="col-span-4 border-r dark:border-gray-700">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
            </div>
            <div className="overflow-y-auto h-[calc(600px-4rem)]">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-gray-50 dark:bg-gray-700'
                      : ''
                  }`}
                  aria-label={`Conversation with ${conversation.participants[0].user.name}`}
                >
                  <img
                    src={conversation.participants[0].user.picture}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {conversation.participants[0].user.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Thread */}
          <div className="col-span-8 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedConversation.participants[0].user.picture}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {selectedConversation.participants[0].user.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedConversation.participants[0].user.rank} • Level{' '}
                        {selectedConversation.participants[0].user.level}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {/* TODO: Implement message thread */}
                  <p className="text-center text-gray-500 dark:text-gray-400">No messages yet</p>
                </div>

                <div className="p-4 border-t dark:border-gray-700">
                  <div className="flex space-x-3">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="flex-1 resize-none rounded-lg border dark:border-gray-600 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      aria-label="Message input"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Send message"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Select a conversation to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 