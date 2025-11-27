export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  enabled?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  expiresIn?: number;
  username: string;
  email: string;
}

export interface OtpRequest {
  email: string;
  otp: string;
}
