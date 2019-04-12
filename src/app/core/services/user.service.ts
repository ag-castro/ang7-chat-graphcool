import { Injectable } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import {
  ALL_USERS_QUERY,
  AllUsersQuery,
  GET_USER_BY_ID_QUERY,
  NEW_USERS_SUBSCRIPTION,
  UserQuery
} from './user.graphql';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private apollo: Apollo
  ) { }

  public users$: Observable<User[]>;
  private userSubscription: Subscription;
  private queryRef: QueryRef<AllUsersQuery>;

  startUserMonitoring(idToExclude: string): void {
    if (!this.users$) {
      this.users$ = this.allUsers(idToExclude);
      this.userSubscription = this.users$.subscribe();
    }
  }

  stopUsersMonitoring(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
      this.userSubscription = null;
      this.users$ = null;
    }
  }

  public allUsers(idToExclude: string): Observable<User[]> {
    this.queryRef = this.apollo.watchQuery<AllUsersQuery>({
      query: ALL_USERS_QUERY,
      variables: {idToExclude},
      fetchPolicy: 'network-only'
    });
    this.queryRef.subscribeToMore({
      document: NEW_USERS_SUBSCRIPTION,
      updateQuery: (previous: AllUsersQuery, {subscriptionData}): AllUsersQuery => {
        const newUser: User = subscriptionData.data['User'].node;
        return {
          ...previous,
          allUsers: ([newUser, ...previous.allUsers]).sort((uA, uB) => {
            if (uA.name < uB.name) { return -1; }
            if (uA.name > uB.name) { return 1; }
          })
        };
      }
    });
    return this.queryRef.valueChanges
      .pipe(
        map(res => res.data.allUsers)
      );
  }

  public getUserById(id: string): Observable<User> {
    return this.apollo.query<UserQuery>({
      query: GET_USER_BY_ID_QUERY,
      variables: {userId: id}
    }).pipe(
      map(res => res.data.User)
    );
  }
}
