import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { map, mergeMap, take } from 'rxjs/operators';
import { ChatService } from '../../services/chat.service';
import { Chat } from '../../models/chat.model';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { FileService } from '../../../core/services/file.service';
import { ErrorService } from '../../../core/services/error.service';
import { FileModel } from '../../../core/models/file.model';

@Component({
  selector: 'app-chat-add-group',
  templateUrl: './chat-add-group.component.html',
  styleUrls: ['./chat-add-group.component.scss']
})
export class ChatAddGroupComponent implements OnInit, OnDestroy {

  constructor(
    private chatService: ChatService,
    private fb: FormBuilder,
    private userService: UserService,
    private dialogRef: MatDialogRef<ChatAddGroupComponent>,
    private snackBar: MatSnackBar,
    private fileService: FileService,
    private errorService: ErrorService
  ) { }

  newGroupForm: FormGroup;
  users$: Observable<User[]>;
  selectedImage: File;
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.users$ = this.userService.users$;
    this.createForm();
    this.listenMembersList();
  }

  private listenMembersList(): void {
    this.subscriptions.push(
      this.members.valueChanges
        .subscribe(() => {
          this.users$ = this.users$
            .pipe(
              map(users => users.filter(user => this.members.controls.every(
                c => c.value.id !== user.id
              )))
            );
        })
    );
  }

  private createForm(): void {
    this.newGroupForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      members: this.fb.array([], Validators.required)
    });
  }

  get title(): FormControl { return this.newGroupForm.get('title') as FormControl; }
  get members(): FormArray { return this.newGroupForm.get('members') as FormArray; }

  addMember(user: User): void {
    this.members.push(this.fb.group(user));
  }

  removeMember(index: number): void {
    this.members.removeAt(index);
  }

  onSelectImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files[0];
    this.selectedImage = file;
  }

  onSubmit(): void {

    let operation: Observable<FileModel> = of(null);
    if (this.selectedImage) {
      operation = this.fileService.upload(this.selectedImage);
    }
    let message: string;
    operation.pipe(
      mergeMap((uploadedImg: FileModel) => {
        const formValue = Object.assign({
          title: this.title.value,
          usersIds: this.members.value.map(member => member.id),
          photoId: (uploadedImg) ? uploadedImg.id : null
        });
        return this.chatService.createGroup(formValue);
      }),
      take(1)
    ).subscribe(
      (chat: Chat) => message = `'${chat.title}' created!`,
      (error) => message = this.errorService.getErrorMessage(error),
      () => {
        this.dialogRef.close();
        this.snackBar.open(
          message,
          'OK',
          {
            duration: 3000
          }
        );
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
