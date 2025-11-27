

import { Component, ElementRef, inject, OnInit, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { ProfileSidebarComponent } from '../profile-sidebar/profile-sidebar.component';
import { ChatMessage } from '../../models/chat.model';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileSidebarComponent],
  template: `
    <div class="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

      <app-profile-sidebar
        [userProfile]="userProfile"
        [messages]="messages"
        [loadingHistory]="loadingHistory"
        (historyTapped)="handleHistoryTap($event)">
      </app-profile-sidebar>

      <div class="flex-1 flex flex-col">

        <header class="bg-gray dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center shadow-sm z-10">
          <h1 class="font-bold text-lg text-gray-800 dark:text-gray-100">Bot Conversation</h1>

          <div class="flex items-center space-x-4">
            <button (click)="logout()"
                    class="py-2 px-4 rounded-md text-sm font-medium text-white bg-red-600 dark:bg-red-500">
              Logout
            </button>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800" #scrollContainer>

          <div *ngIf="loadingHistory" class="flex justify-center mt-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700 dark:border-indigo-400"></div>
          </div>

          <div *ngFor="let msg of messages"
              class="flex w-full"
              [ngClass]="{'justify-end': !msg.fromBot, 'justify-start': msg.fromBot}">

            <div class="max-w-[80%] md:max-w-[70%] rounded-2xl px-5 py-3 shadow-md relative"
                 [ngClass]="{
                   'bg-indigo-600 text-white rounded-br-none': !msg.fromBot,
                   'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-none': msg.fromBot
                 }">
              <p class="whitespace-pre-wrap leading-relaxed">{{ msg.message }}</p>
              <span class="text-[10px] block mt-2 opacity-60"
                    [ngClass]="{'text-indigo-100': !msg.fromBot, 'text-gray-400 dark:text-gray-500': msg.fromBot}">
                {{ formatTime(msg.createdAt) }}
              </span>
            </div>
          </div>

          <div *ngIf="isTyping" class="flex justify-start w-full">
            <div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex gap-1">
              <span class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></span>
              <span class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-100"></span>
              <span class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4">
          <form (ngSubmit)="sendMessage()" class="flex gap-3 max-w-4xl mx-auto">
            <input type="text" [(ngModel)]="newMessage" name="message"
              placeholder="Ask StudyBot anything..."
              class="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-full px-6 py-3 focus:ring-2 focus:ring-indigo-600 focus:outline-none shadow-inner dark:text-gray-100"
              [disabled]="isTyping" autocomplete="off">

            <button type="submit" [disabled]="!newMessage.trim() || isTyping"
              class="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center disabled:opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';
  isTyping = false;
  loadingHistory = true;
  userProfile: User | null = null;

  chatService = inject(ChatService);
  authService = inject(AuthService);

  ngOnInit() {
    this.loadProfile();
    this.loadHistory();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  loadProfile(): void {
    this.authService.fetchProfile().subscribe({
      next: (profile: User) => {
        this.userProfile = profile;
      },
      error: (err: any) => {
        console.error("Error loading profile:", err);
      }
    });
  }

  loadHistory() {
    this.chatService.getHistory().subscribe({
      next: (history: ChatMessage[]) => {
        this.messages = history;
        this.loadingHistory = false;
        this.scrollToBottom();
      },
      error: (err: any) => {
        console.error('Failed to load history:', err);
        this.loadingHistory = false;
      }
    });
  }

  handleHistoryTap(messageId: number | undefined): void {
    if (!messageId) return;
    console.log(`History item tapped with ID: ${messageId}. Loading entire thread...`);
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.isTyping) return;

    const textToSend = this.newMessage;

    const userMsg: ChatMessage = {
      message: textToSend,
      fromBot: false,
      createdAt: new Date().toISOString()
    };

    this.messages = [...this.messages, userMsg];

    this.newMessage = '';
    this.isTyping = true;
    this.scrollToBottom();

    this.chatService.sendMessage(textToSend).subscribe({
      next: (response: ChatMessage) => {
        this.messages = [...this.messages, response];
        this.isTyping = false;
        this.scrollToBottom();
      },
      error: () => {
        this.messages = [...this.messages, {
          message: "Error connecting to the service. Please try again.",
          fromBot: true,
          createdAt: new Date().toISOString()
        }];
        this.isTyping = false;
        this.scrollToBottom();
      }
    });
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  logout() {
    this.authService.logout();
  }

  formatTime(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
