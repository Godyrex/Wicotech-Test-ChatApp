import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket | null = null;
  private messageHistorySubject = new BehaviorSubject<any[]>([]);
  private messagesSubject = new BehaviorSubject<any>([]);
  private unreadGroupMessagesSubject = new BehaviorSubject<number>(0);

  constructor(private authService: AuthService,private router: Router, private toastr: ToastrService) {
    console.log('ChatService created');
    this.authService.getSocket().subscribe(socket => {
      this.socket = socket;
      if (this.socket) {
        console.log('Socket connected:', this.socket.connected);
        this.listenForMessageHistory();
        this.requestMessageHistory();
        this.listenForMessages();
        this.listenForUnreadGroupMessages();
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

  private listenForUnreadGroupMessages() {
    if (this.socket) {
      this.socket.on('receiveMessage', (message) => {
        if (message.from !== this.authService.getUserName()) {
          const currentRoute = this.router.url;
          const isGroupChat = currentRoute.includes('/group/chat');
          if (!isGroupChat) {
            const unreadMessages = this.unreadGroupMessagesSubject.value + 1;
            this.unreadGroupMessagesSubject.next(unreadMessages);
            this.toastr.info(`New message from ${message.from}`);
            console.log('Unread group messages updated:', unreadMessages);
          }
        }
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

  getUnreadGroupMessages(): Observable<number> {
    return this.unreadGroupMessagesSubject.asObservable();
  }

  requestMessageHistory() {
    if (this.socket) {
      this.socket.emit('requestMessageHistory');
    }
  }

  clearMessages() {
    this.messagesSubject.next([]);
  }

  clearUnreadGroupMessages() {
    this.unreadGroupMessagesSubject.next(0);
  }
}