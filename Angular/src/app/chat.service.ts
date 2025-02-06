import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket = io('http://localhost:5000'); 

  sendMessage(message: string, username: string) {
    this.socket.emit('sendMessage', { text: message, username });
  }

  getMessages(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('receiveMessage', (message) => observer.next(message));
    });
  }

  getMessageHistory(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('messageHistory', (messages) => observer.next(messages));
    });
  }
}
