import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  messages: any[] = [];
  newMessage = '';
  username = '';

  constructor(private chatService: ChatService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
    this.username = this.authService.getUserName();

    this.chatService.getMessageHistory().subscribe(messages => {
      this.messages = messages;
      console.log("old messages : ",messages);
    });

    this.chatService.getMessages().subscribe(message => {
      this.messages.push(message);
    });
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.chatService.sendMessage(this.newMessage, this.username);
      this.newMessage = '';
    }
  }
}
