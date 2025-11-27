import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 class="text-3xl font-bold text-center text-primary mb-6">Bot Register</h2>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Username</label>
            <input type="text" [(ngModel)]="name" name="name" required
                   class="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none">
            <div *ngIf="submitted && !name" class="text-red-500 text-sm mt-1">
              Please enter your username
            </div>
          </div>

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
                  class="w-full bg-primary text-white py-2 rounded-lg bg-indigo-700 transition"
                  [disabled]="isLoading">
            {{ isLoading ? 'Registering...' : 'Register' }}
          </button>
        </form>

        <p class="mt-4 text-center text-sm text-gray-600">
          Already have an account? <a routerLink="/login" class="text-primary hover:underline">Login</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  submitted = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  onSubmit() {
    this.submitted = true;

    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.authService.register({ username: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        // Navigate to OTP verification page after registration
        this.router.navigate(['/verify-otp'], { queryParams: { email: this.email } });
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
