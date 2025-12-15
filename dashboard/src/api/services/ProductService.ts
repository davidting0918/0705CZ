import { apiClient } from '../client';
import type {
  ApiResponse,
  ProductInfo,
  ApiProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilters,
  ProductListResponse,
  BulkDeleteRequest,
} from '../types';

class ProductService {
  // Map API product response to internal ProductInfo format
  private mapApiProductToProductInfo(apiProduct: ApiProductResponse): ProductInfo {
    return {
      product_id: apiProduct.product_id,
      name: apiProduct.name,
      description: apiProduct.description,
      currency: apiProduct.currency,
      price: apiProduct.price,
      sku: apiProduct.product_sku,
      category: apiProduct.category,
      stock: apiProduct.qty,
      image_url: apiProduct.photo_url,
      is_active: apiProduct.is_active,
      created_at: apiProduct.created_at,
      updated_at: apiProduct.updated_at,
    };
  }

  // Get products with filters
  async getProducts(filters?: ProductFilters): Promise<ProductListResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.category) params.append('category', filters.category);
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset !== undefined) params.append('offset', filters.offset.toString());
    }

    const queryString = params.toString();
    const endpoint = `/products/info${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<ApiResponse<ApiProductResponse[]> & { total: number; limit: number; offset: number }>(endpoint);
    
    // Map API products to internal format
    const mappedProducts = response.data.map(product => this.mapApiProductToProductInfo(product));
    
    return {
      data: mappedProducts,
      total: response.total,
      limit: response.limit,
      offset: response.offset,
    };
  }

  // Get single product by ID
  async getProductById(productId: string): Promise<ProductInfo> {
    const response = await apiClient.get<ApiResponse<ApiProductResponse>>(
      `/products/${productId}`
    );
    return this.mapApiProductToProductInfo(response.data);
  }

  // Create a new product
  async createProduct(data: CreateProductRequest): Promise<ProductInfo> {
    const response = await apiClient.post<ApiResponse<ApiProductResponse>>(
      '/products/create',
      {
        product_sku: data.sku,
        name: data.name,
        description: data.description || undefined,
        currency: data.currency || 'TWD',
        price: data.price,
        qty: data.stock,
        photo_url: data.image_url || undefined,
        category: data.category || undefined,
        is_active: data.is_active !== undefined ? data.is_active : true,
      }
    );
    return this.mapApiProductToProductInfo(response.data);
  }

  // Update a product
  async updateProduct(productId: string, data: UpdateProductRequest): Promise<ProductInfo> {
    // Map internal format to API format
    const apiData: Record<string, any> = {};
    if (data.name !== undefined) apiData.name = data.name;
    if (data.description !== undefined) apiData.description = data.description;
    if (data.price !== undefined) apiData.price = data.price;
    if (data.sku !== undefined) apiData.product_sku = data.sku;
    if (data.category !== undefined) apiData.category = data.category;
    if (data.stock !== undefined) apiData.qty = data.stock;
    if (data.image_url !== undefined) apiData.photo_url = data.image_url;
    if (data.is_active !== undefined) apiData.is_active = data.is_active;

    const response = await apiClient.put<ApiResponse<ApiProductResponse>>(
      `/products/${productId}/update`,
      apiData
    );
    return this.mapApiProductToProductInfo(response.data);
  }

  // Delete a product
  async deleteProduct(productId: string): Promise<void> {
    await apiClient.delete(`/products/${productId}/delete`);
  }

  // Bulk delete products
  // Falls back to individual deletes if bulk endpoint doesn't exist
  async bulkDeleteProducts(productIds: string[]): Promise<void> {
    try {
      const request: BulkDeleteRequest = { product_ids: productIds };
      await apiClient.post('/products/bulk/delete', request);
    } catch (err: any) {
      // If bulk endpoint doesn't exist (404), fall back to individual deletes
      if (err?.status === 404) {
        await Promise.all(productIds.map(id => this.deleteProduct(id)));
      } else {
        throw err;
      }
    }
  }

  // Get product categories
  async getCategories(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/products/categories');
    return response.data;
  }
}

export const productService = new ProductService();

