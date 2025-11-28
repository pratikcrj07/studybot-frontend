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
    <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
      <app-profile-sidebar
        [userProfile]="userProfile"
        [messages]="messages"
        [loadingHistory]="loadingHistory"
        (historyTapped)="handleHistoryTap($event)">
      </app-profile-sidebar>

      <div class="flex-1 flex flex-col">
        <header class="bg-gray dark:bg-gray-800 border-b p-4 flex justify-between items-center">
          <h1 class="font-bold text-lg">Bot Conversation</h1>
          <button (click)="logout()" class="py-2 px-4 rounded-md bg-red-600 text-white">Logout</button>
        </header>

        <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
          <div *ngIf="loadingHistory" class="flex justify-center mt-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>

          <div *ngFor="let msg of messages"
               [attr.id]="'msg-' + msg.id"
               class="flex w-full"
               [ngClass]="{'justify-end': !msg.fromBot, 'justify-start': msg.fromBot}">
            <div class="max-w-[80%] rounded-2xl px-5 py-3 shadow-md"
                 [ngClass]="{
                   'bg-indigo-600 text-white rounded-br-none': !msg.fromBot,
                   'bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-bl-none': msg.fromBot
                 }">
              <p class="whitespace-pre-wrap leading-relaxed">{{ msg.message }}</p>
              <span class="text-[10px] block mt-2 opacity-60">{{ formatTime(msg.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border-t p-4">
          <form (ngSubmit)="sendMessage()" class="flex gap-3 max-w-4xl mx-auto">
            <input type="text" [(ngModel)]="newMessage" name="message"
                   placeholder="Ask StudyBot anything..."
                   class="flex-1 border rounded-full px-6 py-3" autocomplete="off">
            <button type="submit" [disabled]="!newMessage.trim()"
                    class="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center">
              ➤
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
  loadingHistory = true;
  userProfile: User | null = null;

  chatService = inject(ChatService);
  authService = inject(AuthService);

  ngOnInit() {
    this.loadProfile();
    this.loadHistory(); // load latest thread
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  loadProfile() {
    this.authService.fetchProfile().subscribe(profile => this.userProfile = profile);
  }

  loadHistory(chatId?: number) {
    this.loadingHistory = true;

    const obs = chatId
      ? this.chatService.getThread(chatId)
      : this.chatService.getAllHistory();

    obs.subscribe({
      next: (history) => {
        this.messages = history.slice(-12); // last 12 messages
        this.loadingHistory = false;
        if (!chatId) this.scrollToBottom();
      }
    });
  }

  handleHistoryTap(messageId: number) {
    this.loadHistory(messageId);

    setTimeout(() => {
      const el = document.getElementById(`msg-${messageId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const localMsg: ChatMessage = {
      message: this.newMessage,
      fromBot: false,
      createdAt: new Date().toISOString()
    };

    this.messages.push(localMsg);
    this.newMessage = '';
    this.scrollToBottom();

    this.chatService.sendMessage(localMsg.message).subscribe({
      next: res => { this.messages.push(res); this.scrollToBottom(); },
      error: () => {
        this.messages.push({
          message: 'Error connecting to the service.',
          fromBot: true,
          createdAt: new Date().toISOString()
        });
        this.scrollToBottom();
      }
    });
  }

  scrollToBottom() {
    try { this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight; }
    catch (_) {}
  }

  logout() {
    this.authService.logout();
  }

  formatTime(time?: string) {
    if (!time) return '';
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
