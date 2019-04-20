import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {Apollo} from 'apollo-angular';
import { Base64 } from 'js-base64';
import {Observable, ReplaySubject, throwError, of} from 'rxjs';
import { map, tap, catchError, mergeMap, take } from 'rxjs/operators';
import {
  AUTHENTICATE_USER_MUTATION,
  SIGNUP_USER_MUTATION,
  LoggedInUserQuery,
  LOGGED_IN_USER_QUERY
} from './auth.graphql';
import { StorageKeys } from '../../utils/storage-keys';
import { User } from '../models/user.model';
import { ApolloConfigModule } from '../../apollo-config.module';
import { UserService } from './user.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private  apollo: Apollo,
    private apolloConfigModule: ApolloConfigModule,
    private router: Router,
    private userService: UserService
    ) {
      this.init();
    }

  public authUser: User;
  public redirectURL: string;
  public keepSigned: boolean;
  public rememberMe: boolean;
  private _isAuthenticate = new ReplaySubject<boolean>(1);

  init(): void {
    this.keepSigned = JSON.parse(window.localStorage.getItem(StorageKeys.KEEP_SIGNED));
    this.rememberMe = JSON.parse(window.localStorage.getItem(StorageKeys.REMEMBER_ME));
  }

  toggleKeepSigned(): void {
    this.keepSigned = !this.keepSigned;
    window.localStorage.setItem(StorageKeys.KEEP_SIGNED, this.keepSigned.toString());
  }

  toggleRememberMe(): void {
    this.rememberMe = !this.rememberMe;
    window.localStorage.setItem(StorageKeys.REMEMBER_ME, this.rememberMe.toString());
    if (!this.rememberMe) {
      window.localStorage.removeItem(StorageKeys.USER_EMAIL);
      window.localStorage.removeItem(StorageKeys.USER_PASSWORD);
    }
  }

  setRememberMe(user: {email: string, password: string}): void {
    if (this.rememberMe) {
      window.localStorage.setItem(StorageKeys.USER_EMAIL, Base64.encode(user.email));
      window.localStorage.setItem(StorageKeys.USER_PASSWORD, Base64.encode(user.password));
    }
  }

  getRememberMe(): {email: string, password: string} {
    if (!this.rememberMe) { return null; }
    return {
      email: Base64.decode(window.localStorage.getItem(StorageKeys.USER_EMAIL)),
      password: Base64.decode(window.localStorage.getItem(StorageKeys.USER_PASSWORD))
    };
  }

  logout(): void {
    this.apolloConfigModule.closeWebSocketConnection();
    window.localStorage.removeItem(StorageKeys.AUTH_TOKEN);
    window.localStorage.removeItem(StorageKeys.KEEP_SIGNED);
    this.apolloConfigModule.cachePersistor.purge();
    this.keepSigned = false;
    this._isAuthenticate.next(false);
    this.router.navigate(['/login']);
    this.apollo.getClient().resetStore();
  }

  autoLogin(): Observable<{}> {
    if (!this.keepSigned) {
      this._isAuthenticate.next(false);
      window.localStorage.removeItem(StorageKeys.AUTH_TOKEN);
      return of();
    }
    return this.validateToken()
      .pipe(
        tap(authData => {
          const token = window.localStorage.getItem(StorageKeys.AUTH_TOKEN);
          this.setAuthState({
            id: authData.id, token, isAuthenticated: authData.isAuthenticated
          }, true);
        }),
        mergeMap(res => of()),
        catchError(error => {
          this.setAuthState({id: null, token: null, isAuthenticated: false});
          return throwError(error);
        })
      );
  }

  private validateToken(): Observable<{id: string, isAuthenticated: boolean}> {
    return this.apollo.query<LoggedInUserQuery>({
      query: LOGGED_IN_USER_QUERY,
      fetchPolicy: 'network-only'
    }).pipe(
      map(res => {
        const user = res.data.loggedInUser;
        return {
          id: user && user.id,
          isAuthenticated: user !== null
        };
      }),
      mergeMap(authData => authData.isAuthenticated
        ? of(authData)
        : throwError(new Error('Invalid Token!')))
    );
  }

  private setAuthUser(userId: string): Observable<User> {
    return this.userService.getUserById(userId)
      .pipe(
        tap((user: User) => this.authUser = user)
      );
  }

  private setAuthState(authData: { id: string, token: string, isAuthenticated: boolean },
                       isRefresh: boolean = false): void {
    if (authData.isAuthenticated) {
      window.localStorage.setItem(StorageKeys.AUTH_TOKEN, authData.token);
      this.setAuthUser(authData.id)
        .pipe(
          take(1),
          tap(() => this._isAuthenticate.next(authData.isAuthenticated))
        ).subscribe();
      if (!isRefresh) {
        this.apolloConfigModule.closeWebSocketConnection();
      }
      return;
    }
    this._isAuthenticate.next(authData.isAuthenticated);
  }

  get isAuthenticated(): Observable<boolean> {
    return this._isAuthenticate.asObservable();
  }

  signInUser(variables: {
    id: string, email: string, password: string
  }): Observable<{id: string, token: string}> {
    return this.apollo.mutate({
      mutation: AUTHENTICATE_USER_MUTATION,
      variables
    }).pipe(
      map(res => res.data.authenticateUser),
      tap(res => this.setAuthState({
        id: res && res.id, token: res && res.token, isAuthenticated: res !== null
      })),
      catchError(error => {
        this.setAuthState({id: null, token: null, isAuthenticated: false});
        return throwError(error);
      })
    );
  }

  signUpUser(variables: {
    name: string, email: string, password: string
  }): Observable<{id: string, token: string}> {
    return this.apollo.mutate({
      mutation: SIGNUP_USER_MUTATION,
      variables
    }).pipe(
      map(res => res.data.signupUser),
      tap(res => this.setAuthState({
        id: res && res.id, token: res && res.token, isAuthenticated: res !== null
      })),
      catchError(error => {
        this.setAuthState({id: null, token: null, isAuthenticated: false});
        return throwError(error);
      })
    );
  }
}
