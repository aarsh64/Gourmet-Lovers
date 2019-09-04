import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";
import {
  RestaurantStore,
  RestaurantState
} from "src/app/restaurants/restaurantStore/restaurants.store";
import { Restaurants } from "./restaurants.model";

@Injectable({ providedIn: "root" })
export class RestaurantsQuery extends QueryEntity<
  RestaurantState,
  Restaurants
> {
  constructor(protected store: RestaurantStore) {
    super(store);
    // console.log('inside query function');
  }

  getRestaurantData(
    restaurants: Array<Restaurants>
  ): { [key: string]: Array<string | number> } {
    return restaurants.reduce(
      (
        {
          names: nArray,
          locations: lArray,
          ratings: rArray,
          dates: dArray,
          favourites: fArray
        },
        { name, location, rating, date, favourites }
      ) => {
        return {
          names: [...nArray, name],
          locations: [...lArray, location],
          ratings: [...rArray, rating],
          dates: [...dArray, date],
          favourites: [...fArray, favourites]
        };
      },
      { names: [], locations: [], ratings: [], dates: [], favourites: [] }
    );
  }
  }
