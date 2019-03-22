import { Component } from '@angular/core';

@Component({
  selector: 'app-chat-tab',
  template: `
    <nav mat-tab-nav-bar backgroundColor="primary">
      <a mat-tab-link
         routerLink="./"
         routerLinkActive
         #chatsRla="routerLinkActive"
         [routerLinkActiveOptions]="{exact: true}"
         [active]="chatsRla.isActive">
        Chats
      </a>
      <a mat-tab-link
         routerLink="users"
         routerLinkActive
         #usersRla="routerLinkActive"
         [routerLinkActiveOptions]="{exact: true}"
         [active]="usersRla.isActive">
        Users
      </a>
    </nav>
    <router-outlet></router-outlet>
  `,
})
export class ChatTabComponent {}
