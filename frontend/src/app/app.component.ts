import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { components } from '../api-schema';
import { catchError, map, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { gql } from 'apollo-angular';
import { UsersGQL, UsersQuery } from '../../graphql/generated';

type User = components['schemas']['User'];

export const USERS_QUERY = gql`
  query Users {
    getUsers {
      name
    }
  }
`;

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private http = inject(HttpClient);

  users$!: Observable<User[]>;
  usersFromGraphql$!: Observable<UsersQuery['getUsers']>;
  externalUsers$!: Observable<User[]>;
  externalUsersFailed = false;

  constructor(usersGQL: UsersGQL) {
    this.getUsers();
    this.getExternalUsers();

    this.usersFromGraphql$ = usersGQL
      .watch()
      .valueChanges.pipe(map((result) => result.data.getUsers));
  }

  getUsers() {
    this.users$ = this.http.get<User[]>('/users');
  }

  getExternalUsers() {
    this.externalUsers$ = this.http
      .get<User[]>('https://api.some-other-company.com/users')
      .pipe(
        catchError((error) => {
          this.externalUsersFailed = true;

          throw error;
        }),
      );
  }

  deleteUser(id: string) {
    this.http.delete('/users/' + id).subscribe(() => {
      this.getUsers();
    });
  }
}
