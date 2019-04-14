import { Injectable } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import {
  ALL_USERS_QUERY,
  AllUsersQuery,
  GET_USER_BY_ID_QUERY,
  USERS_SUBSCRIPTION, UPDATE_USER_MUTATION,
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
      document: USERS_SUBSCRIPTION,
      updateQuery: (previous: AllUsersQuery, {subscriptionData}): AllUsersQuery => {
        const subscriptionUser: User = subscriptionData.data.User.node;
        const newAllUsers: User[] = [...previous.allUsers];
        switch (subscriptionData.data.User.mutation) {
          case 'CREATED':
            newAllUsers.unshift(subscriptionUser);
            break;
          case 'UPDATED':
            const userToUpdateIndex: number = newAllUsers.findIndex(usr => usr.id === subscriptionUser.id);
            if (userToUpdateIndex > -1) {
              newAllUsers[userToUpdateIndex] = subscriptionUser;
            }
        }
        return {
          ...previous,
          allUsers: newAllUsers.sort((uA, uB) => {
            if (uA.name < uB.name) { return -1; }
            if (uA.name > uB.name) { return 1; }
            return 0;
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

  updateUser(user: User): Observable<User> {
    return this.apollo.mutate({
      mutation: UPDATE_USER_MUTATION,
      variables: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }).pipe(
      map(res => res.data.updateUser)
    );
  }
}
