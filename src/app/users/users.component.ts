import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { AngularFireAuth } from "@angular/fire/auth";
import { FirebaseDatabase } from "@angular/fire";
import { AngularFireStorage } from "@angular/fire/storage";
import { AngularFirestore } from "@angular/fire/firestore";
import { ToastrService } from "ngx-toastr";
import { RouterModule, Router } from '@angular/router';
import { AppRoutingModule } from 'src/app/app-routing.module';

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.css"]
})
export class UsersComponent implements OnInit {
  userForm: any; //For Form validation............

  constructor(
    public afAuth: AngularFireAuth,
    public db: AngularFirestore,
    private toastr: ToastrService,
    private router:Router,
  ) {}

  ngOnInit() {
    this.userForm = new FormGroup({
      username: new FormControl("", Validators.required),
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(6)
      ])
    });
  }

  Login() {
    this.afAuth.auth
      .signInWithEmailAndPassword(
        this.userForm.value.email,
        this.userForm.value.password
      )
      .then(
        success => {
          console.log("logged in successfullty.");
          this.afAuth.authState.subscribe(v =>
            console.log(v, "auth state after login")
          );
          this.router.navigate(['/restaurantDetails']);
          this.toastr.success("Logged In Successfully!");
          console.log("promise is accepted.");
          // this.loadUser = false;
        },
        error => {
          console.log("error", error);
          this.toastr.error(error.message);
          // this.loadUser = false;
        }
      );
    this.userForm.reset();
  }

  signUp() {
    this.db
      .collection("users")
      .add({
        email: this.userForm.value.email,
        password: this.userForm.value.password
      })
      .then(success => {
        console.log("success", success);
      })
      .catch(err => {
        console.log(err);
        this.toastr.error(err.message);
      });

    return this.afAuth.auth
      .createUserWithEmailAndPassword(
        this.userForm.value.email,
        this.userForm.value.password
      )
      .then(success => {
        console.log("success", success);
        this.userForm.reset();

        this.toastr.info("Account Successfully Created.");
        // this.router.navigate(['/userdata']);
        // this.db.collection("activities").add({
        //   Name: "Demo",
        //   Time: 12,
        // uid: this.usersCustomerId
      });
  }
}
