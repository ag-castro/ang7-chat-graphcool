import { Component, OnInit } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { take } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { ErrorService } from '../../../core/services/error.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private errorService: ErrorService
  ) { }

  user: User;
  isEditing = false;
  isLoading = false;

  ngOnInit(): void {
    this.user = JSON.parse(JSON.stringify(this.authService.authUser));
  }

  onSave(): void {
    this.isLoading = true;
    this.isEditing = false;
    let message: string;
    this.userService.updateUser(this.user)
      .pipe(take(1))
      .subscribe(
        (user: User) => message = 'Profile updated successfull!!!',
        error => message = this.errorService.getErrorMessage(error),
        () => {
          this.isLoading = false;
          this.snackBar.open(message, 'OK', {duration: 3000, verticalPosition: 'top'});
        }
      );
  }

}
