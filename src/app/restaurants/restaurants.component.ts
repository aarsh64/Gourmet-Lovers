import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  NgZone
} from "@angular/core";
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
import { finalize, switchMap } from "rxjs/operators";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { AgmCoreModule, MapsAPILoader } from "@agm/core"; //For Google Maps
//import {} from 'googlemaps';
import { Placeholder } from "@angular/compiler/src/i18n/i18n_ast";
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import * as googleMaps from "@google/maps";
//import { } from '@types/googlemaps';

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
  dateBasedRestaurant = [];
  loactionBasedRestaurant = [];
  favouriteRestaurant = [];
  @ViewChild("search")
  public searchElementRef: ElementRef;
  lng: any;
  lat: any;
  selectedRestaurant = [];
  ranking: any;
  usersCustomerId: string;

  constructor(
    public afAuth: AngularFireAuth,
    config: NgbRatingConfig,
    public db: AngularFirestore,
    private storage: AngularFireStorage,
    private toastr: ToastrService,
    public router: Router,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone // private google:GooglePlaceModule
  ) {
    config.max = 5; //To make rating star max to 5.
    config.readonly = false;
  }

  public handleAddressChange(address: any) {
    console.log("Full Location", address);
    this.Location = address.formatted_address;
    console.log("city:", this.Location);
    console.log('lat',address.geometry.location.lat());
    // Do some stuff
  }
  ngOnInit() {
    this.loadingData = false;
    //   //...........................Google-Maps-API..........................................
    //set google maps defaults
    this.zoom = 4;
    this.latitude = 39.8282;
    this.longitude = -98.5795;

    //create search FormControl
    this.searchControl = new FormControl();

    //set current position
    this.setCurrentPosition();

    //.................Form Validation........................
    this.myForm = new FormGroup({
      name: new FormControl("", Validators.required),
      location: new FormControl("", Validators.required),
      rating: new FormControl("", Validators.required),
      date: new FormControl("", Validators.required),
      image: new FormControl("", Validators.required)
    });

    //.......................Fetching data randomly................................

    this.db
      .collection("restaurants")
      .get()
      .subscribe(querySnapshot => {
        querySnapshot.forEach(result => {
          this.restaurantDetails.push({
            name: result.data().name,
            date: {
              day: result.data().date.day,
              month: result.data().date.month,
              year: result.data().date.year
            },
            location: result.data().location,
            rating: result.data().rating,
            image: result.data().image
          });
          this.loadingData = true;
          // console.log('Detail is:',this.restaurantDetails);
        });
      });
  }
  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }

    //.............................................................................
  }
  //.........................For submiting the restaurant details...........................

  submitRestaurant() {
    //To submit the data into the restaurant collection
    console.log("restaurant name:", this.myForm.value.name);
    this.restaurantsName = this.myForm.value.name;
    this.date2 = this.myForm.value.date;
    console.log("Ranking is:", this.myForm.value.rating);
    this.ranking = this.myForm.value.rating;
    // this.Location =this.myForm.value.loacation;
    console.log("address", this.myForm.value.loacation);
    console.log("ratings", this.ranking);
    console.log("Date", this.date2);

    const filePath = this.fileRef.name;
    // const fileRef = this.storage.ref(filePath);
    // console.log("filePAth", filePath, fileRef);

    const task = this.storage
      .upload(filePath, this.fileRef)
      .then(snapshot => snapshot.ref.getDownloadURL())
      .then(downloadURL => {
        console.log(
          `Successfully uploaded file and got download link - ${downloadURL}`
        );

        this.db.collection("restaurants").add({
          name: this.restaurantsName,
          image: downloadURL,
          date: this.date2,
          rating: this.ranking,
          location: this.Location
        });
        console.log("stored", this.Location);
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
    const file = event.target.files[0];
    this.fileRef = file;
    this.imageName = file.name;
  }

  onTap(x: any) {
    this.favouriteRestaurant = x;
    console.log("jhfsfsfs", this.selectedRestaurant);
  }

  addToFavourites(w: any) {
    this.afAuth.authState.subscribe(auth => {
      this.usersCustomerId = auth.uid;
      console.log("id", auth.uid);
      this.db.collection("favourites").add({
        name: w.name,
        date: {
          day: w.date.day,
          month: w.date.month,
          year: w.date.year
        },
        location: w.location,
        rating: w.rating,
        image: w.image,
        userID: this.usersCustomerId
      });
      console.log("userID:", this.usersCustomerId);
      this.selectedRestaurant = w;

      this.toastr.success("Added to favourites");
    });

    console.log("object Favourite:", w);
  }

  //
  //.......................To Fetch the favourite Restaurants..................................

  favourites(w: any) {
    this.loadingData = false;
    this.restaurantDetails.splice(0, this.restaurantDetails.length);

    this.afAuth.authState.subscribe(auth => {
      this.usersCustomerId = auth.uid;
      this.db
        .collection("favourites", ref => ref.where("userID", "==", auth.uid))
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
              location: result.data().location,
              rating: result.data().rating,
              image: result.data().image
            });
            this.loadingData = true;
          });
        });

      this.toastr.success("Favourites💙 Loaded Succesfullly");

      console.log("Fav Details:", this.restaurantDetails);
    });
  }

  //..................To get the restaurants recently added..................................

  recentlyAdded() {
    this.loadingData = false;

    //...................Fetching data based on Time................................
    this.restaurantDetails.splice(0, this.restaurantDetails.length);

    this.db
      .collection("restaurants", ref => ref.orderBy("date.year", "desc"))
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
              year: result.data().date.year
            },
            location: result.data().location,
            rating: result.data().rating,
            image: result.data().image
          });
          this.loadingData = true;
        });
      });
    this.toastr.success("Recently Added⏲ Loaded Succesfullly");

    console.log("Recently added restaurants:", this.restaurantDetails);
  }

  //...............To get the restaurants based on Ratings............

  topRated() {
    this.loadingData = false;

    this.restaurantDetails.splice(0, this.restaurantDetails.length);
    console.log("inside topRated:", this.restaurantDetails);

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
              year: result.data().date.year
            },
            location: result.data().location,
            rating: result.data().rating,
            image: result.data().image
          });
          this.loadingData = true;
        });
        this.toastr.success("Top Rated ★ Restaurants Loaded!");
      });
    console.log("Top Rated Restaurants:", this.restaurantDetails);
  }

  //......................Restaurants based on locations....................

  searchByLocation() {
    console.log("Location Called with location", this.Location);

    this.loadingData = false;
    if (this.Location == undefined) {
      this.loadingData = true;
      this.toastr.info("Sorry but no Search Result found!");
    }
   
    this.restaurantDetails.splice(0, this.restaurantDetails.length);

    this.db
      .collection("restaurants", ref =>
        ref.where("location", "==", this.Location)
      )
      .get()
      .subscribe(querySnapshot => {
        querySnapshot.forEach(result => {
          this.loadingData = false;
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
              year: result.data().date.year
            },
            location: result.data().location,
            rating: result.data().rating,
            image: result.data().image
          });
          console.log("location based Restaurants:", this.restaurantDetails);
          this.loadingData = true;
        });
      });
    this.toastr.success("Location Based Restaurants Loaded!");
    console.log("Location📍 Based Restaurnts:", this.restaurantDetails);
  }

  //...................Get restaurants in alphabetic order........................
  alphabeticalOrder() {
    this.loadingData = false;

    this.restaurantDetails.splice(0, this.restaurantDetails.length);

    this.db
      .collection("restaurants", ref => ref.orderBy("name", "asc"))
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
              year: result.data().date.year
            },
            location: result.data().location,
            rating: result.data().rating,
            image: result.data().image
          });
          this.loadingData = true;
        });
        this.toastr.success("Loaded Successfully!");
      });
    console.log("alphabeticalOrder Array:", this.restaurantDetails);
  }

  //.................................Just to do logout.....................................

  logout() {
    this.afAuth.auth.signOut();
    this.toastr.success("LoggedOut Succesfullly");
    this.router.navigate(["/login"]);
  }
}
//.......................................END............................................

// //..................To get User's Added Restaurants................
//myPlaces() {
//   //...............To get uId of the user......................

//   this.afAuth.authState.subscribe(auth => {
//     if (auth) {

//       //..................To fetch data of specific user based on the uID...............

//       this.db
//         .collection("restaurants", ref => ref.where("userID", "==", auth.uid))
//         .get()
//         .subscribe(querySnapshot => {
//           querySnapshot.forEach(doc => {
//             this.loadingData = false;
//             console.log("Data:", `${doc.id} => ${doc.data()}`, doc.data());
//             this.restaurantDetails.push({
//               name: doc.data().Name,
//               date: {
//                 day: doc.data().date.day,
//                 month: doc.data().date.month,
//                 year: doc.data().date.year
//               },
//               location: doc.data().location,
//               rating: doc.data().rating,
//               image: doc.data().image
//             });
//           });
//         });
//     }
//   });
// }

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
