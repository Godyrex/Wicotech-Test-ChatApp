import { Component, OnInit, OnDestroy } from '@angular/core';
import { PrivateChatService } from '../private-chat.service';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-private-chat',
  templateUrl: './private-chat.component.html',
  styleUrls: ['./private-chat.component.css'],
})
export class PrivateChatComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  newMessage = '';
  username = '';
  recipient = '';
  loading: boolean = true;
  private messageSubscription: Subscription | null = null;

  constructor(private chatService: PrivateChatService, private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.loading = true;
    this.authService.getAuthenticationStatus().subscribe(isAuthenticated => {
      console.log("User is authenticated: ", isAuthenticated);
      if (!isAuthenticated) {
        this.router.navigate(['/login']);
      }
    });
    this.username = this.authService.getUserName();

    this.route.params.subscribe(params => {
      console.log("Params: ", params['username']);
      this.recipient = params['username'];
      this.requestPrivateMessageHistory();
      this.subscribeToMessages();
      this.chatService.clearUnreadMessages(this.recipient);
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

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
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

  private subscribeToMessages() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.chatService.clearPrivateMessages();
    this.messageSubscription = this.chatService.getPrivateMessages().subscribe((message: { from: string; to: string; text: string }) => {
        if ( message.from === this.recipient && message.to === this.username) {
          console.log("New private message: ", message);
          this.messages.push(message);
        }
    });
  }
}
