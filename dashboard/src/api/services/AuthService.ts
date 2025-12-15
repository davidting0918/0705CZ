import { apiClient } from '../client';
import { tokenUtils } from '../utils';
import type {
  EmailLoginRequest,
  GoogleLoginRequest,
  LoginResponse,
  AdminUser,
  ApiResponse,
  AdminProfileResponse,
} from '../types';

class AuthService {
  // Email login for admin
  async loginWithEmail(email: string, password: string): Promise<LoginResponse> {
    const request: EmailLoginRequest = { email, password };
    const response = await apiClient.post<LoginResponse>(
      '/auth/email/admin/login',
      request
    );
    
    // Store token
    if (response.access_token) {
      tokenUtils.set(response.access_token);
    }
    
    return response;
  }

  // Google login for admin
  async loginWithGoogle(token: string): Promise<LoginResponse> {
    const request: GoogleLoginRequest = { token };
    const response = await apiClient.post<LoginResponse>(
      '/auth/google/admin/login',
      request
    );
    
    // Store token
    if (response.access_token) {
      tokenUtils.set(response.access_token);
    }
    
    return response;
  }

  // Logout - clear token
  logout(): void {
    tokenUtils.remove();
  }

  // Get current token
  getToken(): string | null {
    return tokenUtils.get();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return tokenUtils.get() !== null;
  }

  // Get current admin profile
  async getAdminProfile(): Promise<AdminProfileResponse> {
    const response = await apiClient.get<ApiResponse<AdminProfileResponse>>(
      '/admins/me'
    );
    return response.data;
  }
}

export const authService = new AuthService();

