import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Verify Email</h2>
        <p class="text-gray-600 mb-6">Enter the OTP sent to <strong>{{email}}</strong></p>
        
        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <input type="text" [(ngModel)]="otp" name="otp" placeholder="Enter 6-digit OTP" required maxlength="6"
            class="w-full text-center text-2xl tracking-widest px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none">
          
          <div *ngIf="errorMessage" class="text-red-500 text-sm bg-red-50 p-2 rounded">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="text-green-600 text-sm bg-green-50 p-2 rounded">
            {{ successMessage }}
          </div>

          <button type="submit" [disabled]="otp.length < 6 || isLoading"
            class="w-full bg-primary text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
            {{ isLoading ? 'Verifying...' : 'Verify OTP' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class VerifyOtpComponent implements OnInit {
  email = '';
  otp = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      if(!this.email) this.router.navigate(['/register']);
    });
  }

  onSubmit() {
    this.isLoading = true;
    this.authService.verifyOtp({ email: this.email, otp: this.otp }).subscribe({
      next: (res) => {
        this.successMessage = 'Verification successful! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.errorMessage = err.error || 'Invalid OTP';
        this.isLoading = false;
      }
    });
  }
}