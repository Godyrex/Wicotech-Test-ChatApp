import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class PrivateChatService {
  private socket: Socket | null = null;
  private privateMessageHistorySubject = new BehaviorSubject<any[]>([]);
  private privateMessagesSubject = new BehaviorSubject<any>([]);
  private unreadMessagesSubject = new BehaviorSubject<{ [key: string]: number }>({});

  constructor(private authService: AuthService,private router: Router,private toastr: ToastrService) {
    console.log('PrivateChatService created');
    this.authService.getSocket().subscribe(socket => {
      this.socket = socket;
      if (this.socket) {
        console.log('Socket connected:', this.socket.connected);
        this.listenForPrivateMessageHistory();
        this.listenForPrivateMessages();
        this.listenForUnreadMessages();
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

  private listenForPrivateMessages() {
    if (this.socket) {
      this.socket.on('receivePrivateMessage', (message) => {
        this.privateMessagesSubject.next(message);
        console.log('Received private message:', message);
      });
    }
  }

  private listenForUnreadMessages() {
    if (this.socket) {
      this.socket.on('receivePrivateMessage', (message) => {
        if (message.to === this.authService.getUserName()) {
          const currentRoute = this.router.url;
          const isCurrentConversation = currentRoute.includes(`/chat/${message.from}`);
          if (!isCurrentConversation) {
            const unreadMessages = this.unreadMessagesSubject.value;
            unreadMessages[message.from] = (unreadMessages[message.from] || 0) + 1;
            this.unreadMessagesSubject.next(unreadMessages);
            this.toastr.info(`New message from ${message.from}`);
            console.log('Unread messages updated:', unreadMessages);
          }
        }
      });
    }
  }

  sendPrivateMessage(message: string, from: string, to: string) {
    if (this.socket) {
      this.socket.emit('sendPrivateMessage', { text: message, from, to });
    }
  }

  getPrivateMessages(): Observable<any> {
    return this.privateMessagesSubject.asObservable();
  }

  getPrivateMessageHistory(): Observable<any[]> {
    return this.privateMessageHistorySubject.asObservable();
  }

  getUnreadMessages(): Observable<{ [key: string]: number }> {
    return this.unreadMessagesSubject.asObservable();
  }

  requestPrivateMessageHistory(from: string, to: string) {
    console.log('Requesting private message history:', from, to);
    if (this.socket) {
      this.socket.emit('requestPrivateMessageHistory', { from, to });
    }
  }

  clearPrivateMessages() {
    this.privateMessagesSubject.next([]);
  }

  clearUnreadMessages(from: string) {
    const unreadMessages = this.unreadMessagesSubject.value;
    delete unreadMessages[from];
    this.unreadMessagesSubject.next(unreadMessages);
  }
}
