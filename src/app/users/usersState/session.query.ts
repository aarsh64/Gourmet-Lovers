import { Injectable } from '@angular/core';
import { Query, toBoolean } from '@datorama/akita';
import { filter, map } from 'rxjs/operators';
import { SessionState, SessionStore } from './session.store';

@Injectable({
    providedIn: 'root'
})
export class SessionQuery extends Query<SessionState> {
    [x: string]: any;

    isLoggedIn$ = this.select(({ user }) => toBoolean(user));

    loggedInUser$ = this.select().pipe(
        filter(({ user }) => toBoolean(user)),
        map(({ user: { email: e, password: p } }) => `${e} ${p}`)
    );

    constructor(protected store: SessionStore) {
        super(store);
    }

    isLoggedIn() {
        return toBoolean(this.getSnapshot().user);
    }
   
}