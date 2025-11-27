import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, switchMap, tap, of } from 'rxjs';
import { AuthResponse, OtpRequest, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = 'https://studybot-backend-production.up.railway.app';

  currentUser = signal<User | null>(null);

  constructor() {
    const token = this.getToken();
    if (token) {
      this.fetchProfile().subscribe({
        next: (user) => this.currentUser.set(user),
        error: () => this.logout()
      });
    }
  }

  register(user: User): Observable<string> {
    return this.http.post(`${this.apiUrl}/api/users/register`, user, { responseType: 'text' });
  }

  verifyOtp(data: OtpRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/api/users/verify-otp`, data, { responseType: 'text' });
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/users/login`, credentials).pipe(
      tap(res => localStorage.setItem('token', res.token)),
      switchMap(() => this.fetchProfile()),
      tap(user => this.currentUser.set(user))
    );
  }

  fetchProfile(): Observable<User> {
    const token = this.getToken();
    if (!token) return of(null as any);
    return this.http.get<User>(`${this.apiUrl}/api/users/profile`);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
