import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.css"]
})
export class UsersComponent implements OnInit {
  userForm: any; //For Form validation............
  loaduser: boolean;//Used for loading loop

  constructor(
    public afAuth: AngularFireAuth,
    public db: AngularFirestore,
    private toastr: ToastrService,
    private router: Router
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
  login() {
    this.loaduser = true;
    this.afAuth.auth
      .signInWithEmailAndPassword(
        this.userForm.value.email,
        this.userForm.value.password
      )
      .then(
        (success) => {
          this.toastr.success("Logged In Successfully!");
          this.router.navigate(["/restaurantDetails"]);
          this.loaduser = false;
        },
        error => {
          this.toastr.error(error.message);
        }
      );
    this.userForm.reset();
  }
  signUp() {
    this.loaduser = true;
    this.db
      .collection("users")
      .add({
        email: this.userForm.value.email,
        password: this.userForm.value.password
      })
      .then(success => {})
      .catch(err => {
        this.toastr.error(err.message);
        this.loaduser = false;
      });
    return this.afAuth.auth
      .createUserWithEmailAndPassword(
        this.userForm.value.email,
        this.userForm.value.password
      )
      .then(success => {
        this.userForm.reset();
        this.toastr.info("Account Successfully Created. Welcome!");
        this.router.navigate(["/restaurantDetails"]);
      });
  }
}

//------------------------------------------END OF THE CODE--------------------------------------------