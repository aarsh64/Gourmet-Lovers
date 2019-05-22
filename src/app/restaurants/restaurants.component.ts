///<reference types="@types/googlemaps" />
import { Component, OnInit, Input, ViewChild, ElementRef, NgZone, ChangeDetectorRef } from "@angular/core";
import {
  NgbModal,
  ModalDismissReasons,
  NgbRatingConfig,
  NgbDate
} from "@ng-bootstrap/ng-bootstrap";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import { AngularFirestore } from "@angular/fire/firestore";
import { ConstantPool } from "@angular/compiler";
import { AngularFireStorage } from "@angular/fire/storage";
import { AngularFireAuth } from "@angular/fire/auth";
import { ToastrService } from "ngx-toastr";
import { finalize, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AgmCoreModule, MapsAPILoader } from "@agm/core"; //For Google Maps
//import {} from '@types/googlemaps';
import { Placeholder } from '@angular/compiler/src/i18n/i18n_ast';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';



let google: any;

@Component({
  selector: "app-restaurants",
  templateUrl: "./restaurants.component.html",
  styleUrls: ["./restaurants.component.css"],
  providers: [NgbRatingConfig]
})
export class RestaurantsComponent implements OnInit {
  myForm: any;
  date2: any;
  profileUrl: Observable<string | null>;
  downloadURL: Observable<string>;
  public latitude: number = 51.678418;
  public longitude: number = 7.809007;
  public searchControl: FormControl;
  public zoom: number;
  uploadPercent: Observable<number>;
  fileRef: any; //...........to get the uploaded file.....
  Location: any; //..........to get the loacation.......
  imageName: any; //........To store the downloadURL...
  temp: any;
  restaurantDetails = []; //to store the all the restaurant details
  restaurantsName: any;
  imageURL: any;
  sortRestaurantResult = []; //to store data based on Rating(descending order)
  loadingData: boolean = false;
  dateBasedRestaurant = []
  loactionBasedRestaurant = [];
  closeResult: string;
  selectedRestaurant: any;

  @ViewChild("search")
  public searchElementRef: ElementRef;
  lng: any;
  lat: any;
  favouriteRestaurants=[];
  ranking: any;

  constructor(
    public afAuth: AngularFireAuth,
    config: NgbRatingConfig,
    public db: AngularFirestore,
    private storage: AngularFireStorage,
    private toastr: ToastrService,
    public router: Router,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private modalService: NgbModal,
    private cd: ChangeDetectorRef
    // private google:GooglePlaceModule
  ) {
    config.max = 5; //To make rating star max to 5.
    config.readonly = false;
  }

  public handleAddressChange(address: any) {
    // Do some stuff
  }
  ngOnInit() {

    // this.mapsAPILoader.load().then(
    //   () =>{
    //     let autocomplete= new google.maps.places.Autocomplete(this.searchElement.nativeElement,{types:"address"});
    //         autocomplete.addListener('place_changed',() =>{
    //         this.ngZone.run(() => {
    //           let place:google.maps.places.PlaceResult = autocomplete.getPlace();
    //           if(place.geometry === undefined || place.geometry === null ){
    //             return;
    //           }
    //         });
    //     })
    //   }
    // );


    this.loadingData = false;


    //   //...........................Google-Maps-API..........................................
    //   //set google maps defaults
    //   this.zoom = 4;
    //   this.latitude = 39.8282;
    //   this.longitude = -98.5795;

    //   //create search FormControl
    //   this.searchControl = new FormControl();

    //   //set current position
    //   this.setCurrentPosition();

    //   //load Places Autocomplete
    //   this.mapsAPILoader.load().then(() => {
    //     let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
    //       types: ["address"]
    //     });
    //     autocomplete.addListener("place_changed", () => {
    //       this.ngZone.run(() => {
    //         //get the place result
    //         let place: google.maps.places.PlaceResult = autocomplete.getPlace();
    //         console.log('place is:', place);
    //         console.log('place name is:', place.formatted_address);
    //         this.Location = place.formatted_address;
    //         //verify result
    //         if (place.geometry === undefined || place.geometry === null) {
    //           return;
    //         }

    //         //set latitude, longitude and zoom
    //         this.latitude = place.geometry.location.lat();
    //         this.longitude = place.geometry.location.lng();
    //         console.log('cords:', this.latitude, this.longitude)
    //         this.zoom = 12;
    //       });
    //     });
    //   });
    // }

    // private setCurrentPosition() {
    //   if ("geolocation" in navigator) {
    //     navigator.geolocation.getCurrentPosition((position) => {
    //       this.latitude = position.coords.latitude;
    //       this.longitude = position.coords.longitude;
    //       this.zoom = 12;
    //     });
    //   }
    //   //.............................................................................



    //   //.............................................................................

    //.................Form Validation........................
    this.myForm = new FormGroup({
      name: new FormControl("", Validators.required),
      location: new FormControl("", Validators.required),
      rating: new FormControl("", Validators.required),
      date: new FormControl("", Validators.required),
      image: new FormControl('', Validators.required),
    });

    //.......................Fetching data randomly................................

    this.db
      .collection("restaurants")
      .get()
      .subscribe(querySnapshot => {
        querySnapshot.forEach(result => {
          console.log(
            "fetched restaurant data is:",
            `${result.id} => ${result.data()}`,
            result.data()
          );

          this.restaurantDetails.push({
            name: result.data().name,
            date: {
              day: result.data().date.day,
              month: result.data().date.month,
              year: result.data().date.year,
            },
            location: result.data().location,
            rating: result.data().rating,
            image: result.data().image

          });
          //  console.log('Normal fetched data:', this.restaurantDetails);
          this.loadingData = true;
        });
      });

    //....................Fetching data based on Rating(from higher to lower)................... 

    // this.db
    //   .collection("restaurants", ref => ref.orderBy("rating", "desc"))
    //   .get()
    //   .subscribe(querySnapshot => {
    //     querySnapshot.forEach(result => {
    //       console.log(
    //         "restaurant data is:",
    //         `${result.id} => ${result.data()}`,
    //         result.data()
    //       );

    //       this.sortRestaurantResult.push({
    //         name: result.data().name,
    //         date: {
    //           day: result.data().date.day,
    //           month: result.data().date.month,
    //           year: result.data().date.year,
    //         },
    //         location: result.data().location,
    //         ratings: result.data().rating,
    //         image: result.data().image

    //       });


    //     });

    //   });


    // console.log('Restaurans based on Ratings:', this.sortRestaurantResult);
    //console.log('Based on Timings:', this.dateBasedRestaurant);
    //console.log('Based on Locaion:', this.loactionBasedRestaurant);
  }

  //.........................For submiting the restaurant details...........................

  submitRestaurant() {
    //To submit the data into the restaurant collection
    console.log('restaurant name:', this.myForm.value.name);
    this.restaurantsName = this.myForm.value.name;
    this.ranking = this.myForm.value.rating;
    this.date2 = this.myForm.value.date;
    this.lat = this.myForm.value.location.latitude;
    this.lng = this.myForm.value.location.longitude;
    console.log("Date", this.date2);

    const filePath = this.fileRef.name;
    const fileRef = this.storage.ref(filePath);
    console.log('filePAth', filePath, fileRef)
    const task = this.storage.upload(filePath, this.fileRef);

    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    fileRef.put(this.fileRef)
      .then(snapshot => {
        return snapshot.ref.getDownloadURL();   // Will return a promise with the download link
      }).then(downloadURL => {
        console.log(`Successfully uploaded file and got download link - ${downloadURL}`);
        this.db.collection('restaurants').add({
          name: this.restaurantsName,
          image: downloadURL,
          date: this.date2,
          rating: this.ranking,
          // location: this.Location
        })
        console.log('stored', this.Location);
        this.toastr.info("Data has been recorded!");
        this.imageURL = downloadURL;
        return downloadURL;
      })
      .catch(error => {
        // Use to signal error if something goes wrong.
        console.log(`Failed to upload file and get link - ${error}`);
      });
    console.log("Date Format", this.myForm.value);
    this.myForm.reset();
  }

  //...........To Upload the picture to FireBase-Storage.......

  uploadFile(event) {
    console.log('kdjfjdsf');
    const file = event.target.files[0];
    this.fileRef = file;
    this.imageName = file.name;
  }

  //.................................Just to do logout.....................................

  logout() {
    this.afAuth.auth.signOut();
    this.toastr.success("LoggedOut Succesfullly");
    this.router.navigate(["/login"]);
  }

 
  onTap(x: any) {
    console.log('initialize:',x);
    this.selectedRestaurant = x;
  }
  addToFavourites(w:any){

    this.db.collection('favourites').add({
      name:w.name,
      date:{
        day:w.date.day,
        month:w.date.month,
        year:w.date.year
      },
      rating:w.rating,
      image:w.image
    });

    this.selectedRestaurant=w;
    this.favouriteRestaurants.push({
      name:w.name,
      date:{
        day:w.date.day,
        month:w.date.month,
        year:w.date.year
      },
      rating:w.rating
    });
    this.toastr.success("Added to favourites");
 
  }
  favourites(w: any) {
    
    this.restaurantDetails.splice(0, this.restaurantDetails.length);

    this.db
      .collection("favourites")
      .get()
      .subscribe(querySnapshot => {
        querySnapshot.forEach(result => {
          console.log(
            "fetched restaurant data is:",
            `${result.id} => ${result.data()}`,
            result.data()
          );
          this.restaurantDetails.push({
            name: result.data().name,
            // loacation:x.loacation,
            date: {
              day: result.data().date.day,
              month: result.data().date.month,
              year: result.data().date.year
            },
            rating: result.data().rating,
            image:result.data().image
          });})
        
        });

    
    this.toastr.success("Favourites Loaded Succesfullly");

    console.log('Fav Details:', this.restaurantDetails);
  }

  topRated() {
    this.restaurantDetails.splice(0, this.restaurantDetails.length);
    console.log('inside topRated:', this.restaurantDetails);


    this.db
      .collection("restaurants", ref => ref.orderBy("rating", "desc"))
      .get()
      .subscribe(querySnapshot => {
        querySnapshot.forEach(result => {
          console.log(
            "restaurant data is:",
            `${result.id} => ${result.data()}`,
            result.data()
          );
          this.restaurantDetails.push({
            name: result.data().name,
            date: {
              day: result.data().date.day,
              month: result.data().date.month,
              year: result.data().date.year,
            },
            location: result.data().location,
            rating: result.data().rating,
            image: result.data().image

          });
        });
        this.toastr.success("Top Rated Restaurants Loaded!");
      });
    console.log('Top Rated Restaurants:', this.restaurantDetails)
  }

  recentlyAdded() {

    //........................Fetching data based on Time........................................
    this.restaurantDetails.splice(0, this.restaurantDetails.length);

    this.db
      .collection("restaurants", ref => ref.orderBy(('date.year'), 'desc'))
      .get()
      .subscribe(querySnapshot => {
        querySnapshot.forEach(result => {
          console.log(
            "restaurant data is:",
            `${result.id} => ${result.data()}`,
            result.data()
          );

          this.restaurantDetails.push({
            name: result.data().name,
            date: {
              day: result.data().date.day,
              month: result.data().date.month,
              year: result.data().date.year,
            },
            location: result.data().location,
            rating: result.data().rating,
            image: result.data().image

          });
          //this.toastr.success("Recenly Added");

        });
      });
      this.toastr.success("Recently Added Loaded Succesfullly");

    console.log('Recently added restaurants:', this.restaurantDetails);

  }

  locationBased() {
    //........................Fetching data based on Location(City).................................
    this.restaurantDetails.splice(0, this.restaurantDetails.length);

    this.db
      .collection("restaurants", ref => ref.orderBy('location'))
      .get()
      .subscribe(querySnapshot => {
        querySnapshot.forEach(result => {
          console.log(
            "restaurant data is:",
            `${result.id} => ${result.data()}`,
            result.data()
          );

          this.restaurantDetails.push({
            name: result.data().name,
            date: {
              day: result.data().date.day,
              month: result.data().date.month,
              year: result.data().date.year,
            },
            location: result.data().location,
            rating: result.data().rating,
            image: result.data().image

          });

        });
      });

    console.log('Location Based Restaurnts:', this.restaurantDetails);


  }


}

//.......................................Extras............................................

//  console.log('Sortin result:', this.restaurantDetails.sort());
              // for(let b=0;b<this.restaurantDetails.length;b++){
              //   for(let c=0;c<(this.restaurantDetails.length-1);c++){
              //    // console.log('inside the loop');
              //     if(this.restaurantDetails[c].ratings < this.restaurantDetails[c+1].ratings){
              //         this.temp=this.restaurantDetails[c];
              //         this.restaurantDetails[c]=this.restaurantDetails[c+1];
              //         this.restaurantDetails[c+1]=this.temp;
              //     }
              //     this.sortRestaurantResult.push({
              //       //name:this.restaurantDetails[c].name,

              //     });
              //   }
              // }