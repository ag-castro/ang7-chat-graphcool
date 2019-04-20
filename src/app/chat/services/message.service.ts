import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { DataProxy } from 'apollo-cache';
import { Observable } from 'rxjs';
import { Message } from '../models/message.model';
import { AllMessagesQuery, CREATE_MESSAGE_MUTATION, GET_CHAT_MESSAGES_QUERY } from './message.graphql';
import { map } from 'rxjs/operators';
import { AllChatsQuery, USER_CHATS_QUERY } from './chat.graphql';
import { AuthService } from '../../core/services/auth.service';
import { BaseService } from '../../core/services/base.service';
import { User } from '../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService extends BaseService{

  constructor(
    private apollo: Apollo,
    private authService: AuthService
  ) {
    super();
  }

  public getChatMessages(chatId: string): Observable<Message[]> {
    return this.apollo.watchQuery<AllMessagesQuery>({
      query: GET_CHAT_MESSAGES_QUERY,
      variables: {chatId},
      fetchPolicy: 'network-only'
    }).valueChanges
      .pipe(
        map(res => res.data.allMessages),
        map(messages => messages.map(msg => {
          const message = Object.assign({}, msg);
          message.sender = new User(message.sender);
          return message;
        }))
      );
  }

  public createMessage(message: { text: string, chatId: string, senderId: string }): Observable<Message> {
    return this.apollo.mutate({
      mutation: CREATE_MESSAGE_MUTATION,
      variables: message,
      optimisticResponse: {
        __typename: 'Mutation',
        createMessage: {
          __typename: 'Message',
          id: '',
          text: message.text,
          createdAt: new Date().toISOString(),
          sender: {
            __typename: 'User',
            id: message.senderId,
            name: '',
            email: '',
            createdAt: '',
            photo: {
              __typename: 'File',
              id: '',
              secret: this.authService.authUser.photo && this.authService.authUser.photo.secret || '',
            },
          },
          chat: {
            __typename: 'Chat',
            id: message.chatId
          }
        }
      },
      update: (store: DataProxy, {data: {createMessage}}) => {
        this.readAndWriteQuery<Message>({
          store,
          newRecord: createMessage,
          query: GET_CHAT_MESSAGES_QUERY,
          queryName: 'allMessages',
          arrayOperation: 'push',
          variables: {chatId: message.chatId}
        });

        try {
          const userChatsVariables = {loggedUserId: this.authService.authUser.id};
          const userChatsData = store.readQuery<AllChatsQuery>({
            query: USER_CHATS_QUERY,
            variables: userChatsVariables
          });
          const newUserChatsList = [...userChatsData.allChats];
          newUserChatsList.map(cht => {
            if (cht.id === createMessage.chat.id) {
              cht.messages = [createMessage];
            }
            return cht;
          });
          userChatsData.allChats = newUserChatsList;
          store.writeQuery({
            query: USER_CHATS_QUERY,
            variables: userChatsVariables,
            data: userChatsData
          });
        } catch (e) {
          console.log(`Query allChats not found in cache!!`);
        }
      }
    }).pipe(
      map(res => res.data.createMessage)
    );
  }

}
