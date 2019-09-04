
// export type Restaurant = {
//     uid : string;
//     name : string;
//     date :{
//         year : number,
//         month : number,
//         day : number
//     };
//     location : string;
//     rating : number;
//     coffeshop : boolean;
//     desserts : boolean;
//     image : string;
//     users : [];
//     favourtites : boolean;
// }

import { Injectable } from '@angular/core';
import { timer, Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';
// import { Student } from './student.model';
import { guid } from '@datorama/akita';
import { ID } from '@datorama/akita';
import { AngularFirestore } from '@angular/fire/firestore';


export type Restaurants = {
  name: string;
  date: {
    day: number,
    month: number,
    year: number
  },
  favourites:boolean,
  image:string,
  location:string,
  rating:number,
  users:string[],
  uid:string
 };


const restaurants: Array<Restaurants> = [
  {
    name: 'Under the Sea',
    favourites:true,
    image:'',
    location:'Ahmedabad',
    uid:'osndnd3pimadf345',
    rating:4,
    users:['psgpfsg'],
    date:{
        day:4,
        month:12,
        year:2019
    }
     },
 ];

@Injectable({
  providedIn: 'root'
})

export class StudentDataService {

  constructor(private db:AngularFirestore) { }
   
  
   getStudents(): Observable<Array<Restaurants>> {
    const rest =  this.db.collection('restaurants').ref.get();
    // console.log('rest',rest);

    return timer(200).pipe(mapTo(restaurants));
  }
}
