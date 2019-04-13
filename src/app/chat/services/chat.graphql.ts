import gql from 'graphql-tag';
import { Chat } from '../models/chat.model';

export interface AllChatsQuery {
  allChats: Chat[];
}

export interface ChatQuery {
  Chat: Chat;
}

const chatFragment = gql`
  fragment ChatFragment on Chat {
    id
    title
    createdAt
    isGroup
    users (
      first: 1,
      filter: {
        id_not: $loggedUserId
      }
    ) {
      id
      name
      email
      createdAt
    }
  }
`;

const chatMessagesFragment = gql`
  fragment ChatMessagesFragment on Chat {
    messages (
      last: 1
    ) {
      id
      createdAt
      text
      sender {
        id
        name
      }
    }
  }
`;

export const USER_CHATS_QUERY = gql`
  query UserChatQuery($loggedUserId: ID!){
    allChats(
      filter: {
        users_some: {
          id: $loggedUserId
        }
      }
    ) {
      ...ChatFragment
      ...ChatMessagesFragment
    }
  }
  ${chatFragment}
  ${chatMessagesFragment}
`;

export const CHAT_BY_ID_OR_USERS_QUERY = gql`
  query ChatByIdOrUserQuery($chatId: ID!, $loggedUserId: ID!, $targetUserId: ID!) {
    Chat (
      id: $chatId
    ) {
      ...ChatFragment
    }
    allChats (
      filter: {
        AND: [
          { users_some: { id: $loggedUserId } },
          { users_some: { id: $targetUserId } }
        ],
        isGroup: false
      }
    ) {
      ...ChatFragment
    }
  }
  ${chatFragment}
`;

export const CREATE_PRIVATE_CHAT_MUTATION = gql`
  mutation CreatePrivateChatMutation($loggedUserId: ID!, $targetUserId: ID!) {
    createChat(
      usersIds: [
        $loggedUserId,
        $targetUserId
      ]
    ) {
      ...ChatFragment
      ...ChatMessagesFragment
    }
  }
  ${chatFragment}
  ${chatMessagesFragment}
`;

export const CREATE_GROUP_MUTATION = gql`
  mutation CreateGroupMutation($title: String!, $usersIds: [ID!]!, $loggedUserId: ID!) {
    createChat(
      title: $title,
      usersIds: $usersIds,
      isGroup: true
    ) {
      ...ChatFragment
      ...ChatMessagesFragment
    }
  }
  ${chatFragment}
  ${chatMessagesFragment}
`;

export const USER_CHATS_SUBSCRIPTION = gql`
  subscription UserChatsSubscription($loggedUserId: ID!) {
    Chat(
      filter: {
        mutation_in: [CREATED, UPDATED]
        node: {
          users_some: {
            id: $loggedUserId
          }
        }
      }
    ) {
      mutation
      node{
        ...ChatFragment
        ...ChatMessagesFragment
      }
    }
  }
  ${chatFragment}
  ${chatMessagesFragment}
`;
