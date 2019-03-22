import { AuthService } from './../core/services/auth.service';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  CanActivateChild,
  CanLoad,
  Route,
  Router
} from '@angular/router';
import { LoginRoutingModule } from './login-routing.module';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';


@Injectable({providedIn: LoginRoutingModule})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(
    private authServive: AuthService,
    private router: Router
    ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.checkAuthState(state.url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.canActivate(route, state);
  }

  canLoad(route: Route): Observable<boolean> {
    // >>>>>> route.path
    const url = window.location.pathname;
    return this.checkAuthState(url)
      .pipe(take(1));
  }

  private checkAuthState(url: string): Observable<boolean> {
    return this.authServive.isAuthenticated
      .pipe(
        tap(is => {
          if (!is) {
            this.authServive.redirectURL = url;
            this.router.navigate(['/login']);
          }
        })
      );
  }

}
