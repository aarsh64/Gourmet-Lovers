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
import { ConstantPool, IfStmt } from "@angular/compiler";
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
import { NgOnChangesFeature, defineBase } from "@angular/core/src/render3";
import { connectableObservableDescriptor } from "rxjs/internal/observable/ConnectableObservable";

@Component({
  selector: "app-restaurants",
  templateUrl: "./restaurants.component.html",
  styleUrls: ["./restaurants.component.css"],
  providers: [NgbRatingConfig]
})
export class RestaurantsComponent implements OnInit {
  myForm: any;
  date2: any; //To store the date locally...................
  restaurantDetails = []; //to store the all the restaurant details
  restaurantsName: any; //To store the restaurnats name locally.....
  imageURL: any;
  sortRestaurantResult = []; //to store data based on Rating(descending order)
  loadingData: boolean = false; //used for the loader which is used for the whole page.....
  favouriteRestaurant = []; //used to get the selected restaurants refrence
  ranking: any;
  usersCustomerId: string;
  geoPoint: geofirex.GeoFirePoint;
  submitData: boolean = true; //for the loader used for submit form...
  closeResult: string;
  userscollection = []; //used this array to store the user'id that will help to get favpourites restaurants

  //............for Google maps autocomplete declaration........
  @ViewChild("search")
  public searchElementRef: ElementRef;
  lng: any;
  lat: any;
  center: any;
  public latitude: number = 51.678418;
  public longitude: number = 7.809007;
  public searchControl: FormControl;
  public zoom: number;

  //GeoFireX
  geo = geofirex.init(firebaseApp);
  points: Observable<any>;
  radius = new BehaviorSubject(0.5);
  //----------

  //................................................................

  //.........declarations for uploading the image to storage.........
  profileUrl: Observable<string | null>;
  downloadURL: Observable<string>;
  uploadPercent: Observable<number>;
  fileRef: any; //...........to get the uploaded file.....
  Location: any; //..........to get the loacation.......
  imageName: any; //........To store the downloadURL...
  //...................................

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

  //..........................TO get tha address........................................
  //.......Function will be called each time whenever the input in autocomplete will be changed.........

  public handleAddressChange(address: any) {
    this.Location = address.formatted_address;
    this.lng = address.geometry.location.lng();
    this.lat = address.geometry.location.lat();
    this.geoPoint = this.geo.point(this.lng, this.lat);
    this.searchByLocation();
  }

  public handleAddressChange1(address: any) {
    this.Location = address.formatted_address;
    this.lng = address.geometry.location.lng();
    this.lat = address.geometry.location.lat();
    this.geoPoint = this.geo.point(this.lng, this.lat);
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
            users: result.data().users,
            favourites: result.data().favourites
          });
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

    //To submit the data into the restaurant collection
    this.restaurantsName = this.myForm.value.name;
    this.date2 = this.myForm.value.date;
    this.ranking = this.myForm.value.rating;
    const filePath = this.fileRef.name;

    const task = this.storage
      .upload(filePath, this.fileRef)
      .then(snapshot => snapshot.ref.getDownloadURL())
      .then(downloadURL => {
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
              favourites: false,
              users: []
            })
            .catch(err => {
              // console.log(err);
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
            .then(x => {})
            .catch(y => {
              this.toastr.error(y);
              this.submitData = true;
            });

          this.submitData = true;
          this.toastr.info("Data has been recorded!");
          this.imageURL = downloadURL;
          return downloadURL;
        });
      })
      .catch(err => {
        // console.log(err);
      });

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
  }

  //.................Will add the selected card to Favourites collection.............................

  addToFavourites(w: any, i: number) {
    this.afAuth.authState.subscribe(auth => {
      if (w.users == undefined) {
        this.userscollection.push(auth.uid);
        this.db
          .collection("restaurants")
          .doc(w.objID)
          .update({ users: this.userscollection })
          .then(() => this.toastr.info("added to favourites,check for once!"))
          .catch(() => {
            this.toastr.error("must be wrong while adding to favourites!");
          });
      } else {
        w.users.push(auth.uid);
        this.userscollection.push(w.users);
        this.db
          .collection("restaurants")
          .doc(w.objID)
          .update({ users: w.users })
          .then(() => this.toastr.info("added to favourites,check for once!"))
          .catch(() => {
            this.toastr.error("must be wrong while adding to favourites!");
          });
      }
    });
  }

  //.......................To Fetch the favourite Restaurants(Function call)..................................

  favourites() {
    this.loadingData = false;
    this.restaurantDetails.splice(0, this.restaurantDetails.length);

    this.afAuth.authState.subscribe(auth => {
      this.usersCustomerId = auth.uid;

      //............Query to get the user-specific favourites restaurants..............
      this.db
        .collection("restaurants", ref =>
          ref.where("users", "array-contains", this.usersCustomerId)
        )
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
              favourites: result.data().favourites,
              objID: result.id
            });
            this.loadingData = true;
          });
          if (this.restaurantDetails.length == 0) {
            this.loadingData = true;
            this.toastr.info("No favourites yet!");
          } else {
            this.toastr.success("Favourites💙 Loaded Succesfullly");
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
  }

  //...............To get the restaurants based on Ratings............

  topRated() {
    this.loadingData = false;

    this.restaurantDetails.splice(0, this.restaurantDetails.length);

    this.db
      .collection("restaurants", ref => ref.orderBy("rating", "desc"))
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
            objID: result.id
          });
          this.loadingData = true;
        });
        this.toastr.success("Top Rated ★ Restaurants Loaded!");
      });
  }

  //..................User's specific added places........................

  myPlaces() {
    this.loadingData = false;

    this.restaurantDetails.splice(0, this.restaurantDetails.length);

    this.afAuth.authState.subscribe(auth => {
      this.usersCustomerId = auth.uid;

      this.db
        .collection("restaurants", ref =>
          ref.where("uid", "==", this.usersCustomerId)
        )
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
              objID: result.id
            });
            this.loadingData = true;
          });
          if (this.restaurantDetails.length == 0) {
            this.loadingData = true;
            this.toastr.info("No Data yet!");
          } else {
            this.toastr.success("My Places Loaded Succesfullly");
          }
        });
    });
  }

  //......................Restaurants based on locations....................

  searchByLocation() {
    this.loadingData = false;
    if (this.Location == undefined) {
      this.toastr.warning("No data/new data is entered!");
      this.loadingData = true;
    }

    const collection = this.geo.collection("placePoints");
    const center = this.geoPoint;
    const radius = 7.25; //........Will give restaurants within given point with radius of 5.5km
    const field = "position";
    const q = collection.within(center, radius, field);
    this.restaurantDetails.splice(0, this.restaurantDetails.length);

    q.subscribe(querySnapshot => {
      querySnapshot.forEach(result => {
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
  }

  //.................................Just to do logout.....................................

  logout() {
    this.afAuth.auth.signOut();
    this.toastr.success("LoggedOut Succesfullly");
    this.router.navigate(["/login"]);
  }

  //......................For Modal..........................

  //........Following function will open the modal with contents given inside.............

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

  //.............Following function will help to close the modal..................................

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

//....................................THE END............................................

//.......................................Extras Below............................................

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

//.....................................................................
