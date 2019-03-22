import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-no-record',
  styleUrls: ['./no-record.component.scss'],
  template: `
    <div class="container-no-record">
      <mat-icon>{{ icon }}</mat-icon>
      <h3>{{title}}</h3>
    </div>
  `,
})
export class NoRecordComponent {
  @Input() icon: string;
  @Input() title: string;
}
