import type { ApiErrorResponse, AdminUser } from './types';

// Environment utilities
export const getAppEnv = (): string => {
  return import.meta.env.VITE_APP_ENV || 'development';
};

// Token storage utilities
const TOKEN_KEY = 'admin_access_token';
const USER_KEY = 'admin_user_data';

export const tokenUtils = {
  get: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  set: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  remove: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

// User data storage utilities
export const userUtils = {
  get: (): AdminUser | null => {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },
  
  set: (user: AdminUser): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  remove: (): void => {
    localStorage.removeItem(USER_KEY);
  }
};

// JWT token decoding utility (basic decode without verification)
export const decodeJWT = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
};

// Extract user info from JWT token
// Returns partial AdminUser (missing admin_id and other fields that come from API)
export const getUserFromToken = (token: string): AdminUser | null => {
  const decoded = decodeJWT(token);
  if (!decoded) return null;

  // Map JWT claims to AdminUser structure
  // Note: admin_id and other fields will be fetched from /admins/me endpoint
  const userId = decoded.sub || decoded.user_id || decoded.id || decoded.admin_id || '';
  return {
    admin_id: decoded.admin_id || userId, // Try to get admin_id from token, fallback to user_id
    email: decoded.email || '',
    name: decoded.name || decoded.username || '',
    photo_url: decoded.photo_url || decoded.picture || null,
    is_active: decoded.is_active ?? true, // Default to true if not in token
    google_id: decoded.google_id || null,
    phone: decoded.phone || null,
    user_id: userId, // For backward compatibility
  };
};

// Error handling utilities
export const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = 'An error occurred';
  
  try {
    const errorData: ApiErrorResponse = await response.json();
    errorMessage = errorData.detail || errorMessage;
  } catch {
    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
  }
  
  const error = new Error(errorMessage);
  (error as any).status = response.status;
  throw error;
};

// Check if error is authentication related
export const isAuthError = (error: any): boolean => {
  return error?.status === 401 || error?.status === 403;
};

