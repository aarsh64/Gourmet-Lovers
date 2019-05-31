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
import { Observable, BehaviorSubject } from "rxjs";
import { Router } from "@angular/router";
import { AgmCoreModule, MapsAPILoader } from "@agm/core"; //For Google Maps
import { Placeholder } from "@angular/compiler/src/i18n/i18n_ast";
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import * as googleMaps from "@google/maps";
import { GeoFireClient } from "geofirex";
import * as geofirex from "geofirex";
import * as firebaseApp from "firebase/app";
import {
  CollectionReference,
  QuerySnapshot,
  GeoPoint
} from "@firebase/firestore-types";
import { toGeoJSON } from "geofirex";

let google: any;
declare var H: any;

@Component({
  selector: "app-restaurants",
  templateUrl: "./restaurants.component.html",
  styleUrls: ["./restaurants.component.css"],
  providers: [NgbRatingConfig]
})
export class RestaurantsComponent implements OnInit {
  //GeoFireX
  geo = geofirex.init(firebaseApp);
  points: Observable<any>;
  radius = new BehaviorSubject(0.5);
  //----------

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
  locationBased = [];
  favouriteRestaurant = [];
  @ViewChild("search")
  public searchElementRef: ElementRef;
  lng: any;
  lat: any;
  center: any;
  selectedRestaurant = [];
  ranking: any;
  usersCustomerId: string;
  geoPoint: geofirex.GeoFirePoint;
  submitData: boolean = true;
  closeResult: string;
  
  constructor(
    public afAuth: AngularFireAuth,
    config: NgbRatingConfig,
    public db: AngularFirestore,
    private storage: AngularFireStorage,
    private toastr: ToastrService,
    public router: Router,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone, // private google:GooglePlaceModule
    private modalService: NgbModal
  ) {
    config.max = 5; //To make rating star max to 5.
    config.readonly = false;
  }
  //..........................TO get tha address.........................................

  public handleAddressChange(address: any) {
    // console.log("Full Location", address);
    this.Location = address.formatted_address;
    this.lng = address.geometry.location.lng();
    // console.log("lng value is:", this.lng);
    this.lat = address.geometry.location.lat();
    this.geoPoint = this.geo.point(this.lng, this.lat);

    // Do some stuff
  }
  ngOnInit() {
    this.loadingData = false;
    //...........................Google-Maps-API..........................................

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
            image: result.data().image,
            objID: result.id,
            favourites:result.data().favourites
          });
         // console.log('objID:',result.id);
          this.loadingData = true;
        });
      });
  }

  //...............update function to change the radius.........

  update(v) {
    this.radius.next(v);
  }

  //...........................To set current Position..............................

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }

  //.........................For submiting the restaurant details...........................

  submitRestaurant() {
    this.submitData = false;
    const cities = this.geo.collection("placePoints");
    // console.log("point value:", this.geoPoint);

    //To submit the data into the restaurant collection
    // console.log("restaurant name:", this.myForm.value.name);
    this.restaurantsName = this.myForm.value.name;
    this.date2 = this.myForm.value.date;
    // console.log("Ranking is:", this.myForm.value.rating);
    this.ranking = this.myForm.value.rating;
    // console.log("address", this.myForm.value.loacation);
    // console.log("ratings", this.ranking);
    // console.log("Date", this.date2);

    const filePath = this.fileRef.name;
    // const fileRef = this.storage.ref(filePath);
    // console.log("filePAth", filePath, fileRef);

    const task = this.storage
      .upload(filePath, this.fileRef)
      .then(snapshot => snapshot.ref.getDownloadURL())
      .then(downloadURL => {
        // console.log(
        //   `Successfully uploaded file and got download link - ${downloadURL}`
        // );

        this.afAuth.authState.subscribe(auth => {
          this.usersCustomerId = auth.uid;

          this.db
            .collection("restaurants")
            .add({
              name: this.restaurantsName,
              image: downloadURL,
              date: this.date2,
              rating: this.ranking,
              location: this.Location,
              uid: this.usersCustomerId,
              favourites:false
            })
            .catch(err => {
              console.log(err);
              this.submitData = true;
              this.toastr.error(err);
            });

          cities
            .add({
              name: this.restaurantsName,
              image: downloadURL,
              date: this.date2,
              rating: this.ranking,
              location: this.Location,
              position: this.geoPoint.data
            })
            .then(x => console.log("upadted geo", x))
            .catch(y => {
              this.toastr.error(y);
              this.submitData = true;
            });

          // console.log("stored", this.Location);
          this.submitData = true;
          this.toastr.info("Data has been recorded!");
          this.imageURL = downloadURL;
          return downloadURL;
        });
      });

    // console.log("Date Format", this.myForm.value);
    this.myForm.reset();
  }

  //...........To Upload the picture to FireBase-Storage.......

  uploadFile(event) {
    const file = event.target.files[0];
    this.fileRef = file;
    this.imageName = file.name;
  }

  //...............Tap Function(not that necessary)................................................
  onTap(x: any) {
    this.favouriteRestaurant = x;
   // console.log("jhfsfsfs", this.favouriteRestaurant);
  }

  //.................Will add the selected card to Favourites collection.............................

  addToFavourites(w: any,i:number) {

    this.afAuth.authState.subscribe(auth => {
      this.usersCustomerId = auth.uid;
      // console.log("id", auth.uid);
        

        if(w.favourites==true){
               this.db.collection('restaurants').doc(w.objID).update({favourites:false}).then(() => {this.toastr.info('Removed From the Favourites')});
               this.restaurantDetails.splice(i,1);
         }
         else{

          this.db.collection('restaurants').doc(w.objID).update({favourites:true}).then(() => {this.toastr.success("Added to favourites,check the list once!");})  
         
        }
      
      // this.db.collection("restaurants").add({
      //   name: w.name,
      //   date: {
      //     day: w.date.day,
      //     month: w.date.month,
      //     year: w.date.year
      //   },
      //   location: w.location,
      //   rating: w.rating,
      //   image: w.image,
      //   userID: this.usersCustomerId
      //   // objID:w.ob
      // });
      // console.log("userID:", this.usersCustomerId);
      this.selectedRestaurant = w;

      // this.toastr.success("Added to favourites");
    });

    console.log("object Favourite:", w);
  }

  //.......................To Fetch the favourite Restaurants(Function call)..................................

  favourites() {  
    this.loadingData = false;
    this.restaurantDetails.splice(0, this.restaurantDetails.length);

    this.afAuth.authState.subscribe(auth => {
      this.usersCustomerId = auth.uid;
      this.db
        .collection("restaurants", ref => ref.where("favourites", "==", true))
        .get()
        .subscribe(querySnapshot => {
          querySnapshot.forEach(result => {
            
            // console.log(
            //   "fetched restaurant data is:",
            //   `${result.id} => ${result.data()}`,
            //   result.data()
            // );
            
            this.restaurantDetails.push({
              name: result.data().name,
              date: {
                day: result.data().date.day,
                month: result.data().date.month,
                year: result.data().date.year
              },
              location: result.data().location,
              rating: result.data().rating,
              image: result.data().image,
              favourites:result.data().favourites,
              objID: result.id

            });
            this.loadingData = true;
          });
          if (this.restaurantDetails.length == 0) {
            this.loadingData = true;
            this.toastr.info("No favourites yet!");
          } else {
            this.toastr.success("Favourites💙 Loaded Succesfullly");
            // console.log("Fav Details:", this.restaurantDetails);
          }
        });
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
          // console.log(
          //   "restaurant data is:",
          //   `${result.id} => ${result.data()}`,
          //   result.data()
          // );

          this.restaurantDetails.push({
            name: result.data().name,
            date: {
              day: result.data().date.day,
              month: result.data().date.month,
              year: result.data().date.year
            },
            location: result.data().location,
            rating: result.data().rating,
            image: result.data().image,
            objID: result.id

          });
          this.loadingData = true;
        });
      });
    this.toastr.success("Recently Added⏲ Loaded Succesfullly");

    // console.log("Recently added restaurants:", this.restaurantDetails);
  }

  //...............To get the restaurants based on Ratings............

  topRated() {
    this.loadingData = false;

    this.restaurantDetails.splice(0, this.restaurantDetails.length);
    // console.log("inside topRated:", this.restaurantDetails);

    this.db
      .collection("restaurants", ref => ref.orderBy("rating", "desc"))
      .get()
      .subscribe(querySnapshot => {
        querySnapshot.forEach(result => {
          // console.log(
          //   "restaurant data is:",
          //   `${result.id} => ${result.data()}`,
          //   result.data()
          // );
          this.restaurantDetails.push({
            name: result.data().name,
            date: {
              day: result.data().date.day,
              month: result.data().date.month,
              year: result.data().date.year
            },
            location: result.data().location,
            rating: result.data().rating,
            image: result.data().image,
            objID: result.id

          });
          this.loadingData = true;
        });
        this.toastr.success("Top Rated ★ Restaurants Loaded!");
      });
    // console.log("Top Rated Restaurants:", this.restaurantDetails);
  }

  //..................User's specific added places........................

  myPlaces() {
    this.loadingData = false;

    this.restaurantDetails.splice(0, this.restaurantDetails.length);
    // console.log("restaurants details:", this.restaurantDetails);

    this.afAuth.authState.subscribe(auth => {
      this.usersCustomerId = auth.uid;

      this.db
        .collection("restaurants", ref =>
          ref.where("uid", "==", this.usersCustomerId)
        )
        .get()
        .subscribe(querySnapshot => {
          querySnapshot.forEach(result => {
            // console.log(
            //   "fetched restaurant data is:",
            //   `${result.id} => ${result.data()}`,
            //   result.data()
            // );
            this.restaurantDetails.push({
              name: result.data().name,
              //location:result.location,
              date: {
                day: result.data().date.day,
                month: result.data().date.month,
                year: result.data().date.year
              },
              location: result.data().location,
              rating: result.data().rating,
              image: result.data().image,
              objID: result.id

            });
            this.loadingData = true;
          });
          if (this.restaurantDetails.length == 0) {
            this.loadingData = true;
            this.toastr.info("No Data yet!");
          } else {
            this.toastr.success("My Places Loaded Succesfullly");
            // console.log("My Places Details:", this.restaurantDetails);
          }
        });
    });
  }

  //......................Restaurants based on locations....................

  searchByLocation() {
    // console.log("Location Called with location", this.geoPoint);

    this.loadingData = false;
    if (this.Location == undefined) {
      this.toastr.warning("No data/new data is entered!");
      this.loadingData = true;
    }

    const collection = this.geo.collection("placePoints");
    const center = this.geoPoint;
    const radius = 7.25; //........Will give restaurants within given point with raius of 5.5km
    const field = "position";
    const q = collection.within(center, radius, field);
    this.restaurantDetails.splice(0, this.restaurantDetails.length);

    q.subscribe(querySnapshot => {
      querySnapshot.forEach(result => {
        // console.log(
        //   "restaurant data is:",
        //   `${result.name} => ${result}`,
        //   result
        // );
        this.date2 = result.date;
        this.restaurantDetails.push({
          name: result.name,
          location: result.location,
          date: {
            day: this.date2.day,
            month: this.date2.month,
            year: this.date2.year
          },
          rating: result.rating,
          image: result.image,
          objID: result.id

        });

        // console.log(this.locationBased, "HHHHHHAAAAAAAA");
        //console.log("Details", result);
        this.loadingData = true;
      });
      if (this.restaurantDetails.length == 0) {
        this.toastr.warning(
          "No data right now,we will reach in this area soon!"
        );
      } else {
        this.toastr.info("Fetched!");
      }
      this.loadingData = true;
      this.Location = undefined;
    });
    // console.log('Does it work?',q);
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
          // console.log(
          //   "restaurant data is:",
          //   `${result.id} => ${result.data()}`,
          //   result.data()
          // );
          this.restaurantDetails.push({
            name: result.data().name,
            date: {
              day: result.data().date.day,
              month: result.data().date.month,
              year: result.data().date.year
            },
            location: result.data().location,
            rating: result.data().rating,
            image: result.data().image,
            objID: result.id

          });
          this.loadingData = true;
        });
        this.toastr.success("Loaded Successfully!");
      });
    // console.log("alphabeticalOrder Array:", this.restaurantDetails);
  }

  //.................................Just to do logout.....................................

  logout() {
    this.afAuth.auth.signOut();
    this.toastr.success("LoggedOut Succesfullly");
    this.router.navigate(["/login"]);
  }

  //......................For Modal..........................

  open(content) {

    this.modalService
      .open(content, { ariaLabelledBy: "modal-basic-title" })
      .result.then(
        result => {
          this.closeResult = `Closed with: ${result}`;
        },
        reason => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
      return `with: ${reason}`;
    }
  }
 //.................................................................... 



}


//.......................................END............................................

//.......................................Extras Below............................................
//.....................................................................
// if (this.Location == undefined) {
//   this.loadingData = true;
//   this.toastr.info("Sorry but no Search Result found!");
// }

// this.restaurantDetails.splice(0, this.restaurantDetails.length);

// this.db
//   .collection("restaurants", ref =>
//     ref.where("location", "==", this.Location)
//   )
//   .get()
//   .subscribe(querySnapshot => {
//     querySnapshot.forEach(result => {
//       this.loadingData = false;
//       console.log(
//         "restaurant data is:",
//         `${result.id} => ${result.data()}`,
//         result.data()
//       );

//       this.restaurantDetails.push({
//         name: result.data().name,
//         date: {
//           day: result.data().date.day,
//           month: result.data().date.month,
//           year: result.data().date.year
//         },
//         location: result.data().location,
//         rating: result.data().rating,
//         image: result.data().image
//       });
//       console.log("location based Restaurants:", this.restaurantDetails);
//       this.loadingData = true;
//     });
//   });
// this.toastr.success("Location Based Restaurants Loaded!");
// console.log("Location📍 Based Restaurnts:", this.restaurantDetails);
