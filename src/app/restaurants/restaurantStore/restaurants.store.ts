import { Injectable } from '@angular/core';
import { EntityState, EntityStore , StoreConfig } from '@datorama/akita';
import { Restaurants } from 'src/app/restaurants/restaurantStore/restaurants.model';
import { CollectionState } from 'akita-ng-fire';
import { AngularFirestore } from '@angular/fire/firestore';
export interface RestaurantState extends CollectionState <Restaurants> { }

@Injectable ({ providedIn: 'root' })
@StoreConfig({name: 'Restaurant'})


export class RestaurantStore extends EntityStore< RestaurantState, Restaurants > {
    constructor(){
        super();
        // console.log('inside stores constructor');
    }
}