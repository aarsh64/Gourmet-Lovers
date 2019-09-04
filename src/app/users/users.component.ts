import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { LoginService } from 'src/app/users/users.service';

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
    private router: Router,
    private loginService:LoginService
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
  loginFunction() {
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
          this.router.navigate(["/login"]);
          this.loaduser=false;
        }
      );
      this.loginService.login(this.userForm.value).subscribe({
        error: (e) => {
          alert(e);
         }
      });
    this.userForm.reset();

  }
  getReady() {
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
        this.router.navigate(["/login"]);
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