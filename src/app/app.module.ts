import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AngularFireStorageModule, StorageBucket } from "@angular/fire/storage";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AgmCoreModule } from "@agm/core"; //For Google Maps
import { AngularFireModule } from "@angular/fire";
import { RestaurantsComponent } from "src/app/restaurants/restaurants.component";
import { UsersComponent } from "./users/users.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { environment } from "src/environments/environment";
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule,Routes } from '@angular/router';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import * as geofirex from 'geofirex';
import * as firebase from 'firebase/app';
import{google} from '@google/maps';
import { AuthGuard } from './auth.guard';
//import {} from '/googlemaps';



@NgModule({
  declarations: [
    AppComponent,
    RestaurantsComponent,
    UsersComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    //google,
    ToastrModule.forRoot(), // ToastrModule added
    BrowserAnimationsModule, // required animations module
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    GooglePlaceModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyCEqAIFrdKSkWDM3BOkgQ8vgODNp8G2Oig",
      libraries: ["places"]
    })
  ],
  providers: [{provide: StorageBucket, useValue: 'restaurantapp-dde4e.appspot.com'},AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule {}
