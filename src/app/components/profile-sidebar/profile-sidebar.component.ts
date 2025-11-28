import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/auth.model';
import { ChatMessage } from '../../models/chat.model';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="w-72 p-6 flex flex-col justify-between border-r border-gray-200 bg-dark dark:bg-gray-800">
      <div>
        <h2 class="text-3xl font-extrabold mb-8 text-indigo-700 dark:text-indigo-400">Api (Bot)</h2>

        <div *ngIf="userProfile" class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner mb-6">
          <div class="text-xl font-semibold mb-1">{{ userProfile.username }}</div>
          <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ userProfile.email }}</p>
        </div>

        <h3 class="text-lg font-semibold mb-3">Recent History</h3>

        <ul class="space-y-3 text-sm max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin">
          <li *ngIf="loadingHistory" class="text-center">Loading history...</li>
          <li *ngIf="!loadingHistory && messages.length === 0" class="text-center">Start a new chat!</li>

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
  `,
})
export class ProfileSidebarComponent {
  @Input() userProfile: User | null = null;
  @Input() messages: ChatMessage[] = [];
  @Input() loadingHistory = false;

  @Output() historyTapped = new EventEmitter<number>();


  get recentHistory(): ChatMessage[] {
    return this.messages.slice(-12).reverse();
  }

  trackByMessageId(index: number, msg: ChatMessage) {
    return msg.id;
  }
}
