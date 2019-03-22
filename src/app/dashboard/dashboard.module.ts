import { NgModule } from '@angular/core';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    DashboardHomeComponent,
    DashboardHeaderComponent
  ],
  imports: [
    SharedModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
