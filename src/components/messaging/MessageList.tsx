import { Box } from '@mui/material';
import { IMessage } from '../../types/social';
import { AmplifyUser } from '../../types/auth';
import MessageBubble from '../chat/MessageBubble';

interface MessageListProps {
  messages: IMessage[];
  currentUser: AmplifyUser;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUser }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2,
        height: '100%',
        overflowY: 'auto',
      }}
    >
      {messages.map((message) => {
        const isOwn = message.userId === currentUser.attributes.sub;
        return (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: isOwn ? 'flex-end' : 'flex-start',
              width: '100%',
            }}
          >
            <MessageBubble message={message} isOwn={isOwn} />
          </Box>
        );
      })}
    </Box>
  );
};

export default MessageList;
