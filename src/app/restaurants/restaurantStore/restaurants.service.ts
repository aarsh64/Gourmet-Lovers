import { Injectable, Inject } from '@angular/core';
import { RestaurantStore, RestaurantState } from './restaurants.store';
import { timer, Observable } from 'rxjs';
import { mapTo, tap } from 'rxjs/operators';
import { books } from 'src/app/restaurants/restaurantStore/books.data'
import { RestaurantsQuery } from './restaurants.query';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestoreCollection } from '@angular/fire/firestore';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { Restaurants, StudentDataService } from './restaurants.model';
import { noop } from '@angular/compiler/src/render3/view/util';
// import { AtomicWrite } from 'akita-ng-fire';
@Injectable( { providedIn : 'root' })
@CollectionConfig({path:'Restaurants'})

export class RestaurantService extends CollectionService<RestaurantState>  {
    
    
    constructor(public restaurantStore:RestaurantStore,
                private restaurantQuery:RestaurantsQuery,
                private studentsDataService:StudentDataService,
              )
                { 
                    super(restaurantStore);
                    // console.log('inside service');
                    const request = this.studentsDataService.getStudents().pipe(
                        tap(s => this.restaurantStore.set(s))
                    );
                            request.subscribe()
             }

            //    async getStudents() {
            //         const request = await this.db.collection('restaurants').ref.get();
            //         return  request.docs.map(doc => console.log(doc));
            //     }
            }

