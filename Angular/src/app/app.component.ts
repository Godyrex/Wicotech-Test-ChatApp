import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'chat-app';
  authenticated: boolean = false;
  username: string = '';

  ngOnInit() {
    this.authService.getAuthenticationStatus().subscribe(isAuthenticated => {
      this.authenticated = isAuthenticated;
      if(this.authenticated) {
        this.username =this.authService.getUserName();
      }
    });
  }
  constructor(private authService:AuthService) {

  }
  
  logout() {
    this.authService.logout();
  }
}
