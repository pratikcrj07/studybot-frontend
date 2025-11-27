import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessage, ChatRequest } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private apiUrl = 'https://studybot-backend-production.up.railway.app';

  getHistory(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/api/chat/history`);
  }

  sendMessage(message: string): Observable<ChatMessage> {
    const body: ChatRequest = { message };
    return this.http.post<ChatMessage>(`${this.apiUrl}/api/chat/message`, body);
  }
}
