import { useEffect, useRef } from 'react';
import { IMessage, IUser } from '../../types/social';
import MessageBubble from '../chat/MessageBubble';

interface MessageListProps {
  messages: IMessage[];
  currentUser: IUser;
}

export default function MessageList({ messages, currentUser }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.author.id === currentUser.id}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
} 