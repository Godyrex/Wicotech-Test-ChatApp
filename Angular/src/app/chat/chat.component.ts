import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../chat.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import * as e from 'cors';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  newMessage = '';
  username = '';
  loading: boolean = true;
  private messageSubscription: Subscription | null = null;

  constructor(private chatService: ChatService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.messages = [];
    this.loading = true;
    this.authService.getAuthenticationStatus().subscribe(isAuthenticated => {
      console.log("User is authenticated: ", isAuthenticated);
      if (!isAuthenticated) {
        this.router.navigate(['/login']);
      }
    });
    this.username = this.authService.getUserName();

    console.log("Fetching message history...");
    this.chatService.getMessageHistory().subscribe(messages => {
      this.messages = messages;
      //wait 1sec
      setTimeout(() => {
        this.loading = false;
      }, 1000);
     // this.loading = false;
      console.log("old messages : ", messages);
    });

    this.subscribeToMessages();
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  private subscribeToMessages() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.chatService.clearMessages();
    this.messageSubscription = this.chatService.getMessages().subscribe(message => {
      if (message.from != null && message.from != this.username) {
        console.log("New message: ", message);
        this.messages.push(message);
      }
    });
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      console.log("Sending message: ", this.newMessage);
      console.log("Username: ", this.username);
      this.chatService.sendMessage(this.newMessage, this.username);
      this.messages.push({ text: this.newMessage, from: this.username });
      this.newMessage = '';
    }
  }
}
