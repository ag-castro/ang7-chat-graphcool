import { User } from '../models/user.model';
import gql from 'graphql-tag';
import { fileFragment } from './file.graphql';

export interface AllUsersQuery {
  User: any;
  allUsers: User[];
}

export interface UserQuery {
  User: User;
}

const userFragment = gql`
  fragment UserFragment on User {
    id
    name
    email
    createdAt
    photo {
      ...FileFragment
    }
  }
  ${fileFragment}
`;

export const ALL_USERS_QUERY = gql`
  query AllUserQuery($idToExclude: ID!) {
    allUsers(
    orderBy: name_ASC,
    filter: {
      id_not: $idToExclude
    }
    ){
      ...UserFragment
    }
  }
  ${userFragment}
`;

export const GET_USER_BY_ID_QUERY = gql`
  query GetUserByIdQuery($userId: ID!) {
    User(id: $userId) {
      ...UserFragment
    }
  }
  ${userFragment}
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUserMutation($id: ID!, $name: String!, $email: String!) {
    updateUser(
      id: $id,
      name: $name,
      email: $email
    ) {
      ...UserFragment
    }
  }
  ${userFragment}
`;

const updateUserPhotoMutation = `
  updateUser(id: $loggedUserId, photoId: $newPhotoId) {
    ...UserFragment
  }
`;

const deleteFileMutation = `
  deleteFile(id: $oldPhotoId) {
    id
    secret
  }
`;

export const getUpdateUserPhotoMutation = (hasOldPhoto: boolean) => {
  if (hasOldPhoto) {
    return gql `
      mutation UpdateAndDeleteUserPhoto($loggedUserId: ID!, $newPhotoId: ID!, $oldPhotoId: ID!) {
        ${updateUserPhotoMutation}
        ${deleteFileMutation}
      }
      ${userFragment}
    `;
  }
  return gql `
      mutation UpdateAndDeleteUserPhoto($loggedUserId: ID!, $newPhotoId: ID!) {
        ${updateUserPhotoMutation}
      }
      ${userFragment}
    `;
};

export const USERS_SUBSCRIPTION = gql`
  subscription UsersSubscription {
    User(
      filter: {
        mutation_in: [CREATED, UPDATED]
      }
    ) {
      mutation
      node {
        ...UserFragment
      }
    }
  }
  ${userFragment}
`;
