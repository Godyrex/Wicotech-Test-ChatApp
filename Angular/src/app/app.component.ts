import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Socket } from 'socket.io-client';
import { PrivateChatService } from './private-chat.service';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'chat-app';
  authenticated: boolean = false;
  username: string = '';
  users: { id_: string, username: string, online: boolean }[] = [];
  unreadMessages: { [key: string]: number } = {};
  unreadGroupMessages: number = 0;

  ngOnInit() {
    this.authService.getAuthenticationStatus().subscribe(isAuthenticated => {
      this.authenticated = isAuthenticated;
      if (this.authenticated) {
        this.username = this.authService.getUserName();
        this.authService.users().subscribe({
          next: (users: any) => {
            this.users = users.map((user: any) => ({ ...user, online: false }));
            this.users = this.users.filter(user => user.username !== this.username);
            console.log("users :", this.users);
          }
        });

        this.authService.getOnlineUsers().subscribe(onlineUsers => {
          this.users.forEach(user => {
            user.online = onlineUsers.includes(user.username);
          });
          console.log("Updated user status:", this.users);
        });

        this.privateChatService.getUnreadMessages().subscribe(unreadMessages => {
          this.unreadMessages = unreadMessages;
          console.log("Unread messages:", this.unreadMessages);
        });

        this.chatService.getUnreadGroupMessages().subscribe(unreadMessages => {
          this.unreadGroupMessages = unreadMessages;
          console.log("Unread group messages:", this.unreadGroupMessages);
        });
      }
    });
  }

  constructor(private authService: AuthService, private privateChatService: PrivateChatService, private chatService: ChatService) {}

  logout() {
    this.authService.logout();
    
  }
}