// Export API client
export { apiClient, getApiBaseUrl } from './client';

// Export services
export { authService } from './services/AuthService';
export { productService } from './services/ProductService';

// Export types
export type {
  EmailLoginRequest,
  GoogleLoginRequest,
  LoginResponse,
  AdminUser,
  ApiErrorResponse,
  ApiResponse,
  ProductInfo,
  ApiProductResponse,
  ProductListResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilters,
  BulkDeleteRequest,
} from './types';

// Export utilities
export { tokenUtils, handleApiError, isAuthError, decodeJWT, getUserFromToken } from './utils';

