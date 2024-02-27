import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
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
      this.router.navigate(['/']);
    } catch (err) {
      this.toastrService.error(err as string);
    }
  }

  loadUser() {
    this.firestoreAuth.authState.subscribe(user => {
      localStorage.setItem('user', JSON.stringify(user));
    });
  }
}
