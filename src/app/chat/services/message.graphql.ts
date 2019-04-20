import { Message } from '../models/message.model';
import gql from 'graphql-tag';
import { fileFragment } from '../../core/services/file.graphql';

export interface AllMessagesQuery {
  allMessages: Message[];
}

const messageFragment = gql`
  fragment MessageFragment on Message {
    id
    text
    createdAt
    sender {
      id
      name
      email
      createdAt
      photo {
        ...FileFragment
      }
    }
    chat {
      id
    }
  }
  ${fileFragment}
`;

export const GET_CHAT_MESSAGES_QUERY = gql`
    query GetChatMessagesQuery($chatId: ID!) {
      allMessages(
        filter: {
          chat: {
            id: $chatId
          }
        },
        orderBy: createdAt_ASC
      ) {
        ...MessageFragment
      }
    }
    ${messageFragment}
`;

export const  CREATE_MESSAGE_MUTATION = gql`
  mutation CreateMessageMutation($text: String!, $chatId: ID!, $senderId: ID!) {
    createMessage (
      text: $text,
      chatId: $chatId,
      senderId: $senderId
    ) {
      ...MessageFragment
    }
  }
  ${messageFragment}
`;

export const USER_MESSAGES_SUBSCRIPTION = gql`
  subscription UserMessagesSubscription($loggedUserId: ID!) {
    Message(
      filter: {
        mutation_in: [CREATED],
        node: {
          chat: {
            users_some: {
              id: $loggedUserId
            }
          }
        }
      }
    ) {
      mutation
      node {
        ...MessageFragment
      }
    }
  }
  ${messageFragment}
`;
