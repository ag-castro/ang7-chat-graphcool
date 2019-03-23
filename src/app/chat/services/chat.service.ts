import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Chat } from '../models/chat.model';
import { Apollo } from 'apollo-angular';
import { AuthService } from '../../core/services/auth.service';
import { AllChatsQuery, CHAT_BY_ID_OR_USERS_QUERY, ChatQuery, USER_CHATS_QUERY } from './chat.graphql';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private apollo: Apollo,
    private authService: AuthService
  ) { }

  getUserChats(): Observable<Chat[]> {
    return this.apollo.query<AllChatsQuery>({
      query: USER_CHATS_QUERY,
      variables: {
        userId: this.authService.authUser.id
      }
    }).pipe(
      map(res => res.data.allChats)
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
}
