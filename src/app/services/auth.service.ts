import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap } from 'rxjs';
import { User, AuthResponse, OtpRequest } from '../models/auth.model';

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

  // --- REGISTER & OTP ---
  register(user: User): Observable<string> {
    return this.http.post(`${this.apiUrl}/api/users/register`, user, { responseType: 'text' });
  }

  verifyOtp(data: OtpRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/api/users/verify-otp`, data, { responseType: 'text' });
  }

  // --- LOGIN ---
  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/users/login`, credentials).pipe(
      tap(res => localStorage.setItem('token', res.token)),
      tap(() => console.log('Token saved to localStorage')),
      tap(() => console.log('Fetching profile...')),
      tap(() => this.fetchProfile().subscribe(user => this.currentUser.set(user)))
    );
  }

  // --- FETCH PROFILE ---
  fetchProfile(token?: string): Observable<User> {
    const authToken = token || this.getToken();
    if (!authToken) return of(null as any);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
    return this.http.get<User>(`${this.apiUrl}/api/users/profile`, { headers });
  }

  // --- HELPERS ---
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
