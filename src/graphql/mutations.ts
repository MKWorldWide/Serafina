import { gql } from '@apollo/client';

export const createMessageMutation = gql`
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
      content
      userId
      userName
      userAvatar
      timestamp
      read
      conversationId
    }
  }
`;

export const onCreateMessageSubscription = gql`
  subscription OnCreateMessage {
    onCreateMessage {
      id
      content
      userId
      userName
      userAvatar
      timestamp
      read
      conversationId
    }
  }
`; 