import { Component } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chat-app';
  authenticated = this.authService.isAuthenticated();
  username=this.authService.getUserName();
  constructor(private authService:AuthService) {

  }
  logout() {
    this.authService.logout();
    this.authenticated = false;
  }
}
