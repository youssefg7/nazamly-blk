import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { collection, doc, getDoc, getDocs, getFirestore } from "@angular/fire/firestore";
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from "@angular/forms";
import { map } from "rxjs/operators";
import User  from "src/app/models/user.model";
import { UserService } from "src/app/services/user.service"; //see line 60 for more info
import { AuthService } from "src/app/services/auth.service";
import { Router } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { UsersService } from "src/app/services/users.service";
import { user } from "rxfire/auth";
@Component({
  selector: "app-registerpage",
  templateUrl: "registerpage.component.html"
})

export class RegisterpageComponent implements OnInit, OnDestroy {
  users? = [];

  isCollapsed = true;
  focus;
  focus1;
  focus2;
  focus3;
  focus4;
  names = ["Youssef", "Mostafa", "Kiro", "Anthony"];
  nameOrder = [];
  registerAttempt;
  loginAttempt;
  db = getFirestore();

  onclick() {
    console.log("clicked");

  }

  addName = neme => {
    this.nameOrder.push(neme);
  }
  removeName = neme => {
    let index = this.nameOrder.indexOf(neme);
    if (index > -1) this.nameOrder.splice(index, 1);
  }

  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    isAdmin: new FormControl(false)
  });

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  })
  constructor(private afAuth: AngularFireAuth, private router: Router, private authService: AuthService, private fb: FormBuilder, private userService: UserService, private usersService: UsersService) { }


  ngOnInit() {
    console.log('ngOnInit called');
    this.userService.getUsers().subscribe(list => this.users = list);
    console.log(this.users.length);
    console.log('ngOnInit finish');
    if (this.authService.userLoggedIn) {                       // if the user's logged in, navigate them to the dashboard (NOTE: don't use afAuth.currentUser -- it's never null)
      this.router.navigate(['home']);
    }
    this.registerAttempt = false;
    this.loginAttempt = false;
  }

/*
    retrieveUsers(): void {
    this.usersService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.users = data;
    });
  }
*/

  onSubmitRegister(): void {
    console.log(this.registerForm.value.name + 'successfully added');
    console.log('register fn');
    this.registerAttempt = true;
    if (this.registerForm.valid) {
      this.registerAttempt = false;
      this.authService.signupUser(this.registerForm.value).then((result) => {
        if (result == null) {
          this.userService.addUser(this.registerForm.value); //error in this line due to circulation of service dependencies: https://angular.io/errors/NG0200
          document.getElementById("failedRegister").style.display = "none";
          document.getElementById("successRegister").style.display = "block";
        } else if (result.isvalid == false) {
          document.getElementById("failedRegister").style.display = "block";
          document.getElementById("successRegister").style.display = "none";
        }

      })
    }
  }

  onSubmitLogin(): void {
    console.log(this.loginForm.value);
    console.log('login fn');
    this.loginAttempt = true;
    if (this.loginForm.valid) {
      this.loginAttempt = false;
      this.authService.loginUser(this.loginForm.value.email, this.loginForm.value.password).then((result) => {
        if (result == null) {
          document.getElementById("failedLogin").style.display = "none";
          this.router.navigate(["home"]);
        }
        else if (result.isValid == false) {
          document.getElementById("failedLogin").style.display = "block";
        }
      })
    }

  }

  get name() {
    return this.registerForm.get('name');
  }

  get newPassword() {
    return this.registerForm.get('password');
  }

  get newEmail() {
    return this.registerForm.get('email');
  }

  get isAdmin() {
    return this.registerForm.get('isAdmin');
  }

  get loginEmail() {
    return this.loginForm.get('email');
  }

  get loginPassword() {
    return this.loginForm.get('password');
  }

  ngOnDestroy() {
    var body = document.getElementsByTagName("body")[0];
    body.classList.remove("register-page");
  }
}
