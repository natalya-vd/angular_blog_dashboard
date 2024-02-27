import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  userEmail!: string;

  ngOnInit(): void {
    const user = localStorage.getItem('user');

    if (user) {
      this.userEmail = JSON.parse(user).email;
    }
  }
}
