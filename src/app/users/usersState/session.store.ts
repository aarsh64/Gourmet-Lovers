import { Injectable } from '@angular/core';
import { Store,StoreConfig} from '@datorama/akita';


export interface User{
    email:string;
    password:string;
    // token:string;
}

export interface SessionState{
    user: User | null;
}

export function createSession(user:User):User{
    return{ ...user };
}
 
export function createInitialState(): SessionState{
    return {
        user:null 
    };
}

@Injectable({
    providedIn: 'root'
})
@StoreConfig({name:'session'})
export class SessionStore extends Store<SessionState> {
    constructor(){
        super( createInitialState() );
    }
    login(data:User){
        const user = createSession(data);
        this.update({ user });
    }

    logout(){
        this.update(createInitialState());
    }
}