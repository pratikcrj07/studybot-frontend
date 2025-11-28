import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/auth.model';
import { ChatMessage } from '../../models/chat.model';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="w-72 p-6 flex flex-col justify-between border-r border-gray-200 bg-dark dark:bg-gray-800 shadow-xl transition-colors duration-300">

      <div>
        <h2 class="text-3xl font-extrabold mb-8 text-indigo-700 dark:text-indigo-400">Api (Bot)</h2>

        <div *ngIf="userProfile" class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner mb-6">
          <div class="text-xl font-semibold mb-1 text-gray-800 dark:text-gray-100">{{ userProfile.username }}</div>
          <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ userProfile.email }}</p>
        </div>

        <h3 class="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Recent History</h3>

        <ul class="space-y-3 text-sm text-gray-600 dark:text-gray-400 max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin">

          <li *ngIf="loadingHistory" class="text-center text-white-500 dark:text-indigo-300">
            Loading history...
          </li>

          <li *ngIf="!loadingHistory && messages.length === 0"
              class="text-center text-gray-400 dark:text-gray-500">
            Start a new chat!
          </li>

          <li *ngFor="let msg of recentHistory; trackBy: trackByMessageId"
              (click)="historyTapped.emit(msg.id)"
              class="truncate p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors"
              title="{{ msg.message }}">

            <span [ngClass]="{'font-medium text-indigo-600 dark:text-indigo-400': !msg.fromBot}">
              {{ msg.fromBot ? 'Bot: ' : 'You: ' }}
            </span>

            {{ msg.message | slice:0:50 }}{{ msg.message.length > 50 ? '...' : '' }}
          </li>

        </ul>
      </div>

    </aside>
  `
})
export class ProfileSidebarComponent {
  @Input() userProfile: User | null = null;
  @Input() messages: ChatMessage[] = [];
  @Input() loadingHistory = false;

  @Output() historyTapped = new EventEmitter<number | undefined>();

  get recentHistory(): ChatMessage[] {
    return this.messages.slice(-6).reverse();
  }

  trackByMessageId(index: number, message: ChatMessage) {
    return message.id;
  }
}
