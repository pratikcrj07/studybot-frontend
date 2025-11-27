import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 class="text-3xl font-bold text-center text-primary mb-6">Bot Login</h2>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" [(ngModel)]="email" name="email" required
                   class="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none">
            <div *ngIf="submitted && !email" class="text-red-500 text-sm mt-1">
              Please enter your email
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" [(ngModel)]="password" name="password" required
                   class="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none">
            <div *ngIf="submitted && !password" class="text-red-500 text-sm mt-1">
              Please enter your password
            </div>
          </div>

          <div *ngIf="errorMessage" class="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
            {{ errorMessage }}
          </div>

          <button type="submit"
                  class="w-full bg-primary text-white py-2 rounded-lg bg-indigo-700 transition">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <p class="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <a routerLink="/register" class="text-primary hover:underline">Register</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  submitted = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  onSubmit() {
    this.submitted = true;
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        // Fetch profile after login
        this.authService.fetchProfile().subscribe({
          next: (user) => {
            if (user) {
              localStorage.setItem('userProfile', JSON.stringify(user));
              this.router.navigate(['/chat']);
            }
            this.isLoading = false;
          },
          error: (err) => {
            this.errorMessage = 'Failed to fetch profile';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
        this.isLoading = false;
      }
    });
  }
}
