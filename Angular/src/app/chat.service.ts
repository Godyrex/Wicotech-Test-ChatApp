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
  private messagesSubject = new BehaviorSubject<any>([]);

  constructor(private authService: AuthService) {
    console.log('ChatService created');
    this.authService.getSocket().subscribe(socket => {
      this.socket = socket;
      if (this.socket) {
        console.log('Socket connected:', this.socket.connected);
        this.listenForMessageHistory();
        this.requestMessageHistory();
        this.listenForMessages();
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

  private listenForMessages() {
    if (this.socket) {
      this.socket.on('receiveMessage', (message) => {
        this.messagesSubject.next(message);
        console.log('Received message:', message);
      });
    }
  }

  sendMessage(message: string, from: string) {
    if (this.socket) {
      this.socket.emit('sendMessage', { text: message, from });
    }
  }

  getMessages(): Observable<any> {
    return this.messagesSubject.asObservable();
  }

  getMessageHistory(): Observable<any[]> {
    return this.messageHistorySubject.asObservable();
  }

  requestMessageHistory() {
    if (this.socket) {
      this.socket.emit('requestMessageHistory');
    }
  }

  clearMessages() {
    this.messagesSubject.next([]);
  }
}