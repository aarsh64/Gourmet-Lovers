import { Component, OnInit, Input, ViewChild, ElementRef, NgZone } from "@angular/core";
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
import { Placeholder } from '@angular/compiler/src/i18n/i18n_ast';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
//import { google } from '@google/maps';

var google:any;

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
  public latitude: number= 51.678418;
  public longitude: number= 7.809007;
  public searchControl: FormControl;
  public zoom: number;
  uploadPercent: Observable<number>;
  fileRef:any; //...........to get the uploaded file.....
  Location:any; //..........to get the loacation.......
  imageName:any; //........To store the downloadURL...
  temp:any;
  restaurantDetails = []; //to store the all the restaurant details
  restaurantsName: any;
  imageURL: any;
  sortRestaurantResult=[]; //to store data based on Rating(descending order)
  loadingData: boolean = false;
  dateBasedRestaurant=[]
  loactionBasedRestaurant=[];
  
  @ViewChild("search")
  public searchElementRef: ElementRef;
  lng: any;
  lat: any;
 
  constructor(
    public afAuth: AngularFireAuth,
    config: NgbRatingConfig,
    public db: AngularFirestore,
    private storage: AngularFireStorage,
    private toastr: ToastrService,
    public router:Router,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
   // private google:GooglePlaceModule
  ) {
    config.max = 5; //To make rating star max to 5.
    config.readonly = false;
    }
  
  public handleAddressChange(address: any) {
    // Do some stuff
}
  ngOnInit() {

    this.loadingData = false;

    
  //   //...........................Google-Maps-API..........................................
  //      //set google maps defaults
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
  //         console.log('place name is:',place.formatted_address);
  //           this.Location=place.formatted_address;
  //         //verify result
  //         if (place.geometry === undefined || place.geometry === null) {
  //           return;
  //         }

  //         //set latitude, longitude and zoom
  //         this.latitude = place.geometry.location.lat();
  //         this.longitude = place.geometry.location.lng();
  //         console.log('cords:',this.latitude,this.longitude)
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
  //.............................................................................

    //.................Form Validation........................
    this.myForm = new FormGroup({
      name: new FormControl("", Validators.required),
      location: new FormControl("", Validators.required),
      ratings: new FormControl("", Validators.required),
      date: new FormControl("", Validators.required),
      image:new FormControl('',Validators.required),
    });
    
//.......................Fetching data randomly................................

    this.db
      .collection("restaurants")
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
                day:result.data().date.day,
                month:result.data().date.month,
                year:result.data().date.year,
              },
              location:result.data().location,
              ratings:result.data().rating,
              image:result.data().image
              
               });
          console.log('Detail is:',this.restaurantDetails);
        });   
      });

//....................Fetching data based on Rating(from higher to lower)................... 
      
this.db
      .collection("restaurants",ref => ref.orderBy("rating","desc"))
      .get()
      .subscribe(querySnapshot => {
        querySnapshot.forEach(result => {
          console.log(
            "restaurant data is:",
            `${result.id} => ${result.data()}`,
            result.data()
          );
          
          this.sortRestaurantResult.push({
            name: result.data().name,
            date: {
                day:result.data().date.day,
                month:result.data().date.month,
                year:result.data().date.year,
              },
              location:result.data().location,
              ratings:result.data().rating,
              image:result.data().image
              
               });
           this.loadingData=true;                        
          console.log('Detail is:',this.restaurantDetails);
        });
           
      });

//........................Fetching data based on Time........................................

      this.db
      .collection("restaurants",ref =>ref.orderBy('date.year'))
      .get()
      .subscribe(querySnapshot => {
        querySnapshot.forEach(result => {
          console.log(
            "restaurant data is:",
            `${result.id} => ${result.data()}`,
            result.data()
          );
          
          this.dateBasedRestaurant.push({
            name: result.data().name,
            date: {
                day:result.data().date.day,
                month:result.data().date.month,
                year:result.data().date.year,
              },
              location:result.data().location,
              ratings:result.data().rating,
              image:result.data().image
              
               });
          console.log('Detail is:',this.dateBasedRestaurant);
        });   
      });
  
//........................Fetching data based on Location(City).................................

this.db
.collection("restaurants",ref =>ref.orderBy('location'))
.get()
.subscribe(querySnapshot => {
  querySnapshot.forEach(result => {
    console.log(
      "restaurant data is:",
      `${result.id} => ${result.data()}`,
      result.data()
    );
    
    this.loactionBasedRestaurant.push({
      name: result.data().name,
      date: {
          day:result.data().date.day,
          month:result.data().date.month,
          year:result.data().date.year,
        },
        location:result.data().location,
        ratings:result.data().rating,
        image:result.data().image
        
         });
    console.log('Detail is:',this.loactionBasedRestaurant);
  });   
});
    }

//.........................For submiting the restaurant details...........................
  
  submitRestaurant() {
    //To submit the data into the restaurant collection
    console.log('restaurant name:',this.myForm.value.name);
    this.restaurantsName=this.myForm.value.name;
    this.date2 = this.myForm.value.date;
    this.lat=this.myForm.value.location.latitude;
    this.lng=this.myForm.value.location.longitude;
    console.log("Date", this.date2);
   
    const filePath = this.fileRef.name;
    const fileRef = this.storage.ref(filePath);
    console.log('filePAth',filePath,fileRef)
    const task = this.storage.upload(filePath,this.fileRef);

      // observe percentage changes
      this.uploadPercent = task.percentageChanges();
    fileRef.put(this.fileRef)
   .then(snapshot => {
       return snapshot.ref.getDownloadURL();   // Will return a promise with the download link
   }).then(downloadURL => {
    console.log(`Successfully uploaded file and got download link - ${downloadURL}`);
    this.db.collection('restaurants').add({
      name: this.restaurantsName,
      image:downloadURL,
      imageName:this.imageName,
      date: this.date2,
      rating: this.myForm.value.ratings,
     // location:this.Location 
    })
    console.log('stored',this.Location);
    this.toastr.info("Data has been recorded!");
    this.imageURL=downloadURL;
    return downloadURL;
 })
  .catch(error => {
      // Use to signal error if something goes wrong.
      console.log(`Failed to upload file and get link - ${error}`);
   });
   console.log("Date Format",this.myForm.value);
   this.myForm.reset();
  }

  //...........To Upload the picture to FireBase-Storage.......

    uploadFile(event) {
    console.log('kdjfjdsf');
         const file = event.target.files[0];
          this.fileRef=file;
          this.imageName=file.name;
   }

  //.................................Just to do logout.....................................
  
  logout() {
    this.afAuth.auth.signOut();
    this.toastr.success("LoggedOut Succesfullly");
    this.router.navigate(["/login"]);
  }

//.......................................Extras............................................

}
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