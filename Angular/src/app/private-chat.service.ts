import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class PrivateChatService {
  private socket: Socket | null = null;
  private privateMessageHistorySubject = new BehaviorSubject<any[]>([]);

  constructor(private authService: AuthService) {
    this.authService.getSocket().subscribe(socket => {
      this.socket = socket;
      if (this.socket) {
        console.log('Socket connected:', this.socket.connected);
        this.listenForPrivateMessageHistory();
      } else {
        console.log('Socket is null');
      }
    });
  }

  private listenForPrivateMessageHistory() {
    if (this.socket) {
      this.socket.on('privateMessageHistory', (messages) => {
        this.privateMessageHistorySubject.next(messages);
        console.log('Received private message history:', messages);
      });
    }
  }

  sendPrivateMessage(message: string, from: string, to: string) {
    if (this.socket) {
      this.socket.emit('sendPrivateMessage', { text: message, from, to });
    }
  }

  getPrivateMessages(from: string, to: string): Observable<any> {
    return new Observable((observer) => {
      if (this.socket) {
        this.socket.on('receivePrivateMessage', (message) => {
          console.log('Received private message:', message);
          if ((message.from === from && message.to === to) || (message.from === to && message.to === from)) {
            observer.next(message);
          }
        });
      }
    });
  }

  getPrivateMessageHistory(): Observable<any[]> {
    return this.privateMessageHistorySubject.asObservable();
  }

  requestPrivateMessageHistory(from: string, to: string) {
    console.log('Requesting private message history:', from, to);
    if (this.socket) {
      this.socket.emit('requestPrivateMessageHistory', { from, to });
    }
  }
}
