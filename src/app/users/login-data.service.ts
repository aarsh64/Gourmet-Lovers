import { Injectable } from '@angular/core';
import { timer, throwError, Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { User } from 'src/app/users/usersState/session.store';

const user: User = {
    email:'aarsh64@gmail.com',
    password:"123456",
    // token: 'ab123abde'
};

interface Credentials {
  username: string;
  password: string;
}


@Injectable({
  providedIn: 'root'
})
export class LoginDataService {

  constructor() { }

  getUser(cred: Credentials): Observable<User> {
    return (cred.username === 'admin' && cred.password === 'admin')
      ? timer(300).pipe(mapTo(user)) :
      throwError('Invalid username or password');
  }
}