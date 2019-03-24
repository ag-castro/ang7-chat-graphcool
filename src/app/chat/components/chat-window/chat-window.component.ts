import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { map, mergeMap, take, tap } from 'rxjs/operators';
import { Chat } from '../../models/chat.model';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { Message } from '../../models/message.model';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../services/chat.service';
import { BaseComponent } from '../../../shared/components/base.component';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent extends BaseComponent<Message> implements OnInit, OnDestroy {

  constructor(
    public authService: AuthService,
    private chatService: ChatService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private title: Title,
    private userService: UserService
  ) {
    super();
  }

  public chat: Chat;
  public messages$: Observable<Message[]>;
  public newMessage = '';
  public recipientID: string = null;
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.title.setTitle('Loading...');
    this.subscriptions.push(
      this.route.data
        .pipe(
          map(routeData => this.chat = routeData.chat),
          mergeMap(() => this.route.paramMap),
          tap((params: ParamMap) => {
            if (!this.chat) {
              this.recipientID = params.get('id');
              this.userService.getUserById(this.recipientID)
                .pipe(take(1))
                .subscribe((user: User) => this.title.setTitle(user.name));
              this.messages$ = of([]);
            } else {
              this.title.setTitle(this.chat.title || this.chat.users[0].name);
              this.messages$ = this.messageService.getChatMessages(this.chat.id);
            }
          })
        )
        .subscribe()
    );
  }

  sendMessage(): void {
    this.newMessage = this.newMessage.trim();
    if (this.newMessage) {
      if (this.chat) {
        this.messageService.createMessage({
          text: this.newMessage,
          chatId: this.chat.id,
          senderId: this.authService.authUser.id
        }).pipe(take(1)).subscribe(console.log);
        this.newMessage = '';
      } else {
        this.createPrivateChat();
      }
    }
  }

  private createPrivateChat(): void {
    this.chatService.createPrivateChat(this.recipientID)
      .pipe(
        take(1),
        tap((chat: Chat) => {
          this.chat = chat;
          this.sendMessage();
        })
      ).subscribe();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.title.setTitle('Angular Graphcool Char');
  }

}
