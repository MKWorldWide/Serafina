import { IConversation } from '../../types/social';
import { useUser } from '../../hooks/useUser';
import { formatDistanceToNow } from 'date-fns';

interface ConversationsListProps {
  conversations: IConversation[];
  selectedConversation: string | null;
  onSelectConversation: (conversationId: string) => void;
  loading?: boolean;
}

export default function ConversationsList({
  conversations,
  selectedConversation,
  onSelectConversation,
  loading = false,
}: ConversationsListProps) {
  const { user } = useUser();

  const getOtherParticipant = (conversation: IConversation) => {
    return conversation.participants.find(
      (p) => p.user.id !== user?.id
    )?.user;
  };

  const getLastMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white border-r border-gray-200">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No conversations yet
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {conversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            const isSelected = selectedConversation === conversation.id;

            return (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
              >
                <img
                  src={otherParticipant?.picture || otherParticipant?.avatar || `/default-avatar.png`}
                  alt={otherParticipant?.username}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {conversation.title || otherParticipant?.username}
                    </h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {getLastMessageTime(conversation.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage.content}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
} 