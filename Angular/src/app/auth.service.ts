import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000';
  private socket: Socket | null = null;
  private socketSubject: BehaviorSubject<Socket | null> = new BehaviorSubject<Socket | null>(null);
  private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.isAuthenticated());
  private onlineUsersSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor(private http: HttpClient, private router: Router) {}

  register(username: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, { username, password });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((res: any) => {
        this.saveToken(res.token);
        this.saveUser({ username: res.username, id: res.id });
        this.connectSocket();
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  users(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  saveUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUserName() {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user).username;
    }
    return null;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticatedSubject.next(false);
    if (this.socket) {
      this.socket.emit('userDisconnected', this.getUserName());
      this.socket.disconnect();
      this.socket = null;
      this.socketSubject.next(null);
    }
    this.router.navigate(['/']);
  }

  getSocket(): Observable<Socket | null> {
    if (!this.socket && this.isAuthenticated()) {
      this.connectSocket();
    }
    return this.socketSubject.asObservable();
  }

  connectSocket() {
    console.log("Connecting socket...");
    this.socket = io(this.apiUrl);
    this.socketSubject.next(this.socket);

    this.socket.on('connect', () => {
      const username = this.getUserName();
      if (username) {
        this.socket!.emit('userConnected', username);
      }
    });

    this.socket.on('updateUserStatus', (onlineUsers: string[]) => {
      this.onlineUsersSubject.next(onlineUsers);
    });
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAuthenticationStatus(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  getOnlineUsers(): Observable<string[]> {
    return this.onlineUsersSubject.asObservable();
  }
}