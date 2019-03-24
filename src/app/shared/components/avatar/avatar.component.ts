import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  template: `
    <div class="avatar-container" [ngStyle]="containerStyles">
      <img [src]="src" [title]="title || 'Avatar'" [alt]="title || 'Avatar'" [ngStyle]="imageStyles" />
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent {

  @Input() public src: string;
  @Input() public title: string;
  @Input() public imageStyles: {[key: string]: string | number} = {};
  @Input() public containerStyles: {[key: string]: string | number} = {};

}
