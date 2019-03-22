import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Chat } from '../models/chat.model';
import { Apollo } from 'apollo-angular';
import { AuthService } from '../../core/services/auth.service';
import { AllChatsQuery, USER_CHATS_QUERY } from './chat.graphql';

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
}
