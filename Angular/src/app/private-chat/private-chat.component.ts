import { Component, OnInit } from '@angular/core';
import { PrivateChatService } from '../private-chat.service';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-private-chat',
  templateUrl: './private-chat.component.html',
  styleUrls: ['./private-chat.component.css'],
})
export class PrivateChatComponent implements OnInit {
  messages: any[] = [];
  newMessage = '';
  username = '';
  recipient = '';
  loading: boolean = true;

  constructor(private chatService: PrivateChatService, private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    //get the recipient from route :username
    this.authService.getAuthenticationStatus().subscribe(isAuthenticated => {
      console.log("User is authenticated: ", isAuthenticated);
      if (!isAuthenticated) {
        this.router.navigate(['/login']);
      }
    });
    this.username = this.authService.getUserName();

    this.route.params.subscribe(params => {
      this.recipient = params['username'];
      this.requestPrivateMessageHistory();
      this.chatService.getPrivateMessages(this.username, this.recipient).subscribe(message => {
        if((message.from || message.to) == this.recipient){
        this.messages.push(message);
        }
      });
    });

    console.log("Fetching private message history...");
    this.chatService.getPrivateMessageHistory().subscribe(messages => {
      this.messages = messages;
      setTimeout(() => {
        this.loading = false;
      }, 1000);
      console.log("Private messages: ", messages);
    });
  }

  sendPrivateMessage() {
    if (this.newMessage.trim() && this.recipient.trim()) {
      console.log("Sending private message: ", this.newMessage);
      console.log("From: ", this.username, "To: ", this.recipient);
      this.chatService.sendPrivateMessage(this.newMessage, this.username, this.recipient);
      this.messages.push({ text: this.newMessage, from: this.username, to: this.recipient });
      this.newMessage = '';
    }
  }

  requestPrivateMessageHistory() {
    console.log("Requesting private message history...");
    console.log("Username: ", this.username, "Recipient: ", this.recipient);
    if (this.recipient.trim()) {
      this.chatService.requestPrivateMessageHistory(this.username, this.recipient);
    }
  }
}
