import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  @ViewChild('loginForm') loginForm!: NgForm;

  constructor(private authService: AuthService) {}

  async onSubmit() {
    if (this.loginForm.invalid) return;

    await this.authService.login(
      this.loginForm.value['email'],
      this.loginForm.value['password']
    );
  }
}
