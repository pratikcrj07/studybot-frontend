import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessage, ChatRequest } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private apiUrl = 'https://studybot-backend-production.up.railway.app/api/chat';

  private getHeaders() {
    return { headers: new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` }) };
  }


  getAllHistory(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/history`, this.getHeaders());
  }

  getThread(chatId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/history/${chatId}`, this.getHeaders());
  }

  sendMessage(message: string): Observable<ChatMessage> {
    const body: ChatRequest = { message };
    return this.http.post<ChatMessage>(`${this.apiUrl}/message`, body, this.getHeaders());
  }
}
