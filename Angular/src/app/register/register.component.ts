import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username = '';
  password = '';
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) { }

  register() {
    this.errorMessage = '';
    console.log(this.username, this.password);
    if (this.username && this.password) {
      this.authService.register(this.username, this.password).subscribe({
        next: (response) => {
          console.log('Registration successful', response);
          this.errorMessage = '';
          this.successMessage = 'Registration successful! Redirecting to login...';
          setTimeout(() => this.router.navigate(['/']), 2000);
        },
        error: (error) => {
          console.error('Registration failed', error);
          this.errorMessage = 'Registration failed';
        }
      });
    } else {
      this.errorMessage = 'Please enter a username and password';
    }
  }
}
