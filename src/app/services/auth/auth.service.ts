import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private firestoreAuth: AngularFireAuth,
    private toastrService: ToastrService
  ) {}

  async login(email: string, password: string) {
    try {
      await this.firestoreAuth.signInWithEmailAndPassword(email, password);

      this.toastrService.success('Logged In Successfully');
    } catch (err) {
      console.log(err);
    }
  }
}
