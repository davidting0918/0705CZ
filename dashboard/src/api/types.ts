// API Request Types
export interface EmailLoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  token: string;
}

// API Response Types
export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  message: string;
}

export interface AdminUser {
  admin_id: string;
  email: string;
  name: string;
  google_id?: string | null;
  phone?: string | null;
  photo_url?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Legacy field for backward compatibility
  user_id?: string;
}

// API Error Response
export interface ApiErrorResponse {
  detail: string;
}

// Standard API Response Format
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// Admin Profile Response
export interface AdminProfileResponse {
  admin_id: string;
  email: string;
  name: string;
  google_id: string | null;
  phone: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Product Types
// Raw API response format (matches API exactly)
export interface ApiProductResponse {
  product_id: string;
  product_sku: string;
  name: string;
  description?: string;
  currency?: string;
  price: number;
  qty: number;
  photo_url?: string;
  category?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Internal ProductInfo type (mapped from API)
export interface ProductInfo {
  product_id: string;
  name: string;
  description?: string;
  currency?: string;
  price: number;
  sku: string;
  category?: string;
  stock: number;
  low_stock_threshold?: number;
  image_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Paginated product list response
export interface ProductListResponse {
  data: ProductInfo[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateProductRequest {
  name: string;
  description: string | null;
  price: number;
  sku: string;
  category: string | null;
  stock: number;
  currency?: string; // Defaults to "TWD" if not provided
  image_url: string | null;
  is_active?: boolean; // Defaults to true if not provided
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  category?: string;
  stock?: number;
  low_stock_threshold?: number;
  image_url?: string;
  is_active?: boolean;
}

export interface ProductFilters {
  category?: string;
  is_active?: boolean; // Filter by active status (default: true in API)
  limit?: number; // Default: 50, min: 1, max: 100
  offset?: number; // Default: 0, min: 0
}

export interface BulkDeleteRequest {
  product_ids: string[];
}

