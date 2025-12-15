import { tokenUtils, handleApiError } from './utils';

/**
 * Get the API base URL based on the current environment
 * Environment priority: APP_ENV > VITE_ENV > default to 'development'
 */
export const getApiBaseUrl = (): string => {
  const appEnv = import.meta.env.APP_ENV || import.meta.env.VITE_ENV || 'development';
  
  switch (appEnv.toLowerCase()) {
    case 'production':
    case 'prod':
      return import.meta.env.VITE_API_PROD_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    
    case 'staging':
      return import.meta.env.VITE_API_STAGING_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    
    case 'development':
    case 'dev':
    default:
      return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  }
};

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Base request method for authenticated requests
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = tokenUtils.get();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    // Handle authentication errors
    if (response.status === 401) {
      tokenUtils.remove();
      // Redirect to login if we're not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw new Error('Authentication required. Please log in again.');
    }

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  }

  // GET request
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  // POST request
  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

