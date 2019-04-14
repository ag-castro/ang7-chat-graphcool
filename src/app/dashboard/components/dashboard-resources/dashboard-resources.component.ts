import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dashboard-resources',
  template: `
    <mat-nav-list dense>
      <a mat-list-item [routerLink]="link.url"
          (click)="onClose()"
          *ngFor="let link of resources">
        <mat-icon matListIcon>{{link.icon}}</mat-icon>
        <h3 matLine>{{link.title}}</h3>
      </a>
      <ng-content></ng-content>
    </mat-nav-list>
  `,
})
export class DashboardResourcesComponent implements OnInit {

  @Input() isMenu = false;
  @Output() close = new EventEmitter<void>();

  resources: any[] = [
    {
      url: '/dashboard/chat',
      icon: 'chat_bubble',
      title: 'Chats'
    },
    {
      url: '/dashboard/chat/users',
      icon: 'people',
      title: 'All Users'
    },
    {
      url: '/dashboard/profile',
      icon: 'person',
      title: 'Profile'
    }
  ];

  ngOnInit(): void {
    if (this.isMenu) {
      this.resources.unshift({
        url: '/dashboard',
        icon: 'home',
        title: 'Home'
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }

}
