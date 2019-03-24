import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { BaseComponent } from '../../../shared/components/base.component';

@Component({
  selector: 'app-chat-users',
  templateUrl: './chat-users.component.html',
  styleUrls: ['./chat-users.component.scss']
})
export class ChatUsersComponent extends BaseComponent<User> implements OnInit {

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {
    super();
  }

  users$: Observable<User[]>;

  ngOnInit() {
    this.users$ = this.userService.allUsers(this.authService.authUser.id);
  }

}
