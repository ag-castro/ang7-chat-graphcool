import { Injectable } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Chat } from '../models/chat.model';
import { Apollo } from 'apollo-angular';
import { AuthService } from '../../core/services/auth.service';
import {
  AllChatsQuery,
  CHAT_BY_ID_OR_USERS_QUERY,
  ChatQuery,
  CREATE_PRIVATE_CHAT_MUTATION,
  USER_CHATS_QUERY
} from './chat.graphql';
import { DataProxy } from 'apollo-cache';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private apollo: Apollo,
    private authService: AuthService,
    private router: Router
  ) { }

  public chats$: Observable<Chat[]>;
  private subscriptions: Subscription[] = [];

  startChatMonitoring(): void {
    this.chats$ = this.getUserChats();
    this.subscriptions.push(this.chats$.subscribe());
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd && !this.router.url.includes('chat')) {
        this.onDestroy();
      }
    });
  }

  getUserChats(): Observable<Chat[]> {
    return this.apollo.watchQuery<AllChatsQuery>({
      query: USER_CHATS_QUERY,
      variables: {
        loggedUserId: this.authService.authUser.id
      }
    }).valueChanges
      .pipe(
      map(res => res.data.allChats),
      map((chats: Chat[]) => {
        const chatsToSort = chats.slice();
        return chatsToSort.sort((a, b) => {
          const valueA = a.messages.length > 0
            ? new Date(a.messages[0].createdAt).getTime()
            : new Date(a.createdAt).getTime();
          const valueB = b.messages.length > 0
            ? new Date(b.messages[0].createdAt).getTime()
            : new Date(b.createdAt).getTime();
          return valueB - valueA;
        });
      })
    );
  }

  getChatByIdOrByUser(chatOrUserId: string): Observable<Chat> {
    return this.apollo.query<ChatQuery | AllChatsQuery>({
      query: CHAT_BY_ID_OR_USERS_QUERY,
      variables: {
        chatId: chatOrUserId,
        loggedUserId: this.authService.authUser.id,
        targetUserId: chatOrUserId
      }
    }).pipe(
      map(res => (res.data['Chat']) ? res.data['Chat'] : res.data['allChats'][0])
    );
  }

  createPrivateChat(targetUserId: string): Observable<Chat> {
    return this.apollo.mutate({
      mutation: CREATE_PRIVATE_CHAT_MUTATION,
      variables: {
        loggedUserId: this.authService.authUser.id,
        targetUserId,
      },
      update: (store: DataProxy, {data: {createChat}}) => {
        const userChatsVariables = { loggedUserId: this.authService.authUser.id };
        const userChatsData = store.readQuery<AllChatsQuery>({
          query: USER_CHATS_QUERY,
          variables: userChatsVariables
        });
        userChatsData.allChats = [createChat, ...userChatsData.allChats];
        store.writeQuery({
          query: USER_CHATS_QUERY,
          variables: userChatsVariables,
          data: userChatsData
        });
        const variables = {
          chatId: targetUserId,
          loggedUserId: this.authService.authUser.id,
          targetUserId
        };
        const data = store.readQuery<AllChatsQuery>({
          query: CHAT_BY_ID_OR_USERS_QUERY,
          variables
        });
        data.allChats = [createChat];
        store.writeQuery({
          query: CHAT_BY_ID_OR_USERS_QUERY,
          variables,
          data
        });
      }
    }).pipe(
      map(res => res.data.createChat)
    );
  }

  private onDestroy(): void {
    this.subscriptions.forEach(subs => subs.unsubscribe());
    this.subscriptions = [];
  }
}
