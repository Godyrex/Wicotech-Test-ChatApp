import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ChatService } from './chat.service';
import { AuthService } from './auth.service';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ChatComponent } from './chat/chat.component';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PrivateChatComponent } from './private-chat/private-chat.component';

@NgModule({
  declarations: [AppComponent, LoginComponent, RegisterComponent, ChatComponent, PrivateChatComponent],
  imports: [BrowserModule,CommonModule, RouterOutlet, RouterLink, AppRoutingModule, FormsModule, HttpClientModule],
  providers: [ChatService, AuthService],
  bootstrap: [AppComponent],
})
export class AppModule {}

