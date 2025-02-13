import React, { useState } from 'react';

interface MessageInputProps {
  onSubmit: (content: string) => Promise<void>;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSubmit, disabled }) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    if (trimmedContent) {
      await onSubmit(trimmedContent);
      setContent('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="p-4 border-t border-gray-200 flex gap-2 items-center"
    >
      <input
        type="text"
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Type a message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={!content.trim() || disabled}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput; 