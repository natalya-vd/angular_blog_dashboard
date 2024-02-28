import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private keyLocalStorage = 'user';
  loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoggedInGuard = false;

  constructor(
    private firestoreAuth: AngularFireAuth,
    private toastrService: ToastrService,
    private router: Router
  ) {}

  async login(email: string, password: string) {
    try {
      await this.firestoreAuth.signInWithEmailAndPassword(email, password);

      this.toastrService.success('Logged In Successfully');
      this.loadUser();

      this.loggedIn.next(true);
      this.isLoggedInGuard = true;
      this.router.navigate(['/']);
    } catch (err) {
      this.toastrService.error(err as string);
    }
  }

  async logout() {
    try {
      await this.firestoreAuth.signOut();

      this.toastrService.success('User Logged Out Successfully');

      localStorage.removeItem(this.keyLocalStorage);
      this.loggedIn.next(false);
      this.isLoggedInGuard = false;
      this.router.navigate(['/login']);
    } catch (err) {
      this.toastrService.error(err as string);
    }
  }

  isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  loadUser() {
    this.firestoreAuth.authState.subscribe(user => {
      if (user) {
        localStorage.setItem(this.keyLocalStorage, JSON.stringify(user));
      }
    });
  }
}
