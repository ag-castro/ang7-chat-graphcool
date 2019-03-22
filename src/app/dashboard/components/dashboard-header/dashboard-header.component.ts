import { Component, Input } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { AuthService } from './../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss']
})
export class DashboardHeaderComponent {

  constructor(
    private authService: AuthService,
    public title: Title
  ) { }

  @Input() sidenav: MatSidenav;

  onLogout(): void {
    this.authService.logout();
  }

}
