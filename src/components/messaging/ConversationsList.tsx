import { IConversation, IUser } from '../../types/social';
import { formatDistanceToNow } from 'date-fns';

interface ConversationsListProps {
  conversations: IConversation[];
  currentUser: IUser;
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  loading?: boolean;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  currentUser,
  selectedConversationId,
  onSelectConversation,
  loading = false
}) => {
  const getOtherParticipant = (conversation: IConversation): IUser => {
    return conversation.participants.find(
      participant => participant.user.id !== currentUser.id
    )?.user || conversation.participants[0].user;
  };

  const getConversationName = (conversation: IConversation): string => {
    if (conversation.type === 'GROUP') {
      return conversation.title || 'Group Chat';
    }
    const otherParticipant = getOtherParticipant(conversation);
    return otherParticipant.name || otherParticipant.username;
  };

  const getConversationAvatar = (conversation: IConversation): string => {
    if (conversation.type === 'GROUP') {
      return conversation.groupAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${conversation.title}`;
    }
    const otherParticipant = getOtherParticipant(conversation);
    return otherParticipant.picture || otherParticipant.avatar || 
           `https://api.dicebear.com/7.x/initials/svg?seed=${otherParticipant.username}`;
  };

  const getLastMessagePreview = (conversation: IConversation): string => {
    if (!conversation.lastMessage) return 'No messages yet';
    return conversation.lastMessage.content.length > 50
      ? `${conversation.lastMessage.content.substring(0, 50)}...`
      : conversation.lastMessage.content;
  };

  const getLastMessageTime = (conversation: IConversation): string => {
    if (!conversation.lastMessage) return '';
    return formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelectConversation(conversation.id)}
          className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-200 ${
            selectedConversationId === conversation.id ? 'bg-blue-50' : ''
          }`}
        >
          <img
            src={getConversationAvatar(conversation)}
            alt={getConversationName(conversation)}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold truncate">
                {getConversationName(conversation)}
              </h3>
              <span className="text-sm text-gray-500 whitespace-nowrap ml-2">
                {getLastMessageTime(conversation)}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">
              {getLastMessagePreview(conversation)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}; 