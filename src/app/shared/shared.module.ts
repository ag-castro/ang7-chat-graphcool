import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatCardModule,
  MatToolbarModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatSlideToggleModule,
  MatListModule,
  MatIconModule,
  MatLineModule,
  MatSidenavModule,
  MatTabsModule, MatMenuModule, MatDialogModule
} from '@angular/material';
import { NoRecordComponent } from './components/no-record/no-record.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { FromNowPipe } from './pipes/from-now.pipe';
import { ImagePreviewComponent } from './components/image-preview/image-preview.component';
import { ReadFilePipe } from './pipes/read-file.pipe';

@NgModule({
  exports: [
    CommonModule,
    AvatarComponent,
    FormsModule,
    FromNowPipe,
    ImagePreviewComponent,
    MatCardModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatLineModule,
    MatListModule,
    MatMenuModule,
    MatToolbarModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    ReactiveFormsModule,
    NoRecordComponent,
    ReadFilePipe
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatDialogModule
  ],
  declarations: [NoRecordComponent, AvatarComponent, FromNowPipe, ImagePreviewComponent, ReadFilePipe],
  entryComponents: [ImagePreviewComponent]
})
export class SharedModule { }
