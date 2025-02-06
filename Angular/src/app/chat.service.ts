import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket | null = null;
  private messageHistorySubject = new BehaviorSubject<any[]>([]);

  constructor(private authService: AuthService) {
    this.authService.getSocket().subscribe(socket => {
      this.socket = socket;
      if (this.socket) {
        console.log('Socket connected:', this.socket.connected);
        this.listenForMessageHistory();
        this.requestMessageHistory();
      } else {
        console.log('Socket is null');
      }
    });
  }

  private listenForMessageHistory() {
    if (this.socket) {
      this.socket.on('messageHistory', (messages) => {
        this.messageHistorySubject.next(messages);
        console.log('Received message history:', messages);
      });
    }
  }

  sendMessage(message: string, from: string) {
    if (this.socket) {
      this.socket.emit('sendMessage', { text: message, from });
    }
  }

  getMessages(): Observable<any> {
    return new Observable((observer) => {
      if (this.socket) {
        this.socket.on('receiveMessage', (message) => observer.next(message));
      }
    });
  }

  getMessageHistory(): Observable<any[]> {
    return this.messageHistorySubject.asObservable();
  }

  requestMessageHistory() {
    if (this.socket) {
      this.socket.emit('requestMessageHistory');
    }
  }
}