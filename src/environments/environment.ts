// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import * as firebase from 'firebase/app';
import { config } from 'rxjs';


export const environment = {
  production: false,
  firebase :{
    apiKey: "AIzaSyBbOH5rbGLxJSP6UQD3IJd75By5J8HAoac",
    authDomain: "restaurantapp-dde4e.firebaseapp.com",
    databaseURL: "https://restaurantapp-dde4e.firebaseio.com",
    projectId: "restaurantapp-dde4e",
    storageBucket: "restaurantapp-dde4e.appspot.com",
    messagingSenderId: "1078065077456",
    appId: "1:1078065077456:web:7d6677725862b527"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
