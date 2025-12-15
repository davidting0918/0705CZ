import { useState, useEffect, useCallback } from 'react';
import { productService } from '../api/services/ProductService';
import type { ProductInfo } from '../api/types';
import type { StockStatus, ProductFilterState } from '../types';
import { stockStatusLabels, stockStatusColors } from '../types';

const Products = () => {
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [filters, setFilters] = useState<ProductFilterState>({
    search: '', // Not used in API, kept for UI compatibility
    category: '',
    stockStatus: 'all', // Not used in API, kept for UI compatibility
    sortBy: 'name', // Not used in API, kept for UI compatibility
    sortOrder: 'asc', // Not used in API, kept for UI compatibility
    page: 1,
    limit: 20,
  });
  const [totalProducts, setTotalProducts] = useState(0);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(true);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await productService.getCategories();
      setCategories(categoriesData);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiFilters = {
        category: filters.category || undefined,
        is_active: isActiveFilter,
        limit: filters.limit,
        offset: (filters.page - 1) * filters.limit,
      };

      const response = await productService.getProducts(apiFilters);
      setProducts(response.data);
      setTotalProducts(response.total);
    } catch (err: any) {
      setError(err.message || '載入產品失敗');
    } finally {
      setLoading(false);
    }
  }, [filters, isActiveFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Get stock status for a product
  const getStockStatus = (product: ProductInfo): StockStatus => {
    if (product.stock === 0) return 'out_of_stock';
    const threshold = product.low_stock_threshold || 10;
    if (product.stock <= threshold) return 'low_stock';
    return 'in_stock';
  };

  // Use products directly (no client-side filtering by stock status)
  const filteredProducts = products;

  // Handle inline editing
  const startEditing = (productId: string, field: string, currentValue: any) => {
    setEditingProduct(productId);
    setEditingField(field);
    setEditValues({ [field]: currentValue });
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setEditingField(null);
    setEditValues({});
  };

  const saveEdit = async (productId: string) => {
    try {
      await productService.updateProduct(productId, editValues);
      await fetchProducts();
      cancelEditing();
    } catch (err: any) {
      setError(err.message || '更新失敗');
    }
  };

  // Handle delete
  const handleDelete = async (productId: string) => {
    if (!confirm('確定要刪除此產品嗎？')) return;
    try {
      await productService.deleteProduct(productId);
      await fetchProducts();
      setSelectedProducts(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    } catch (err: any) {
      setError(err.message || '刪除失敗');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;
    if (!confirm(`確定要刪除選取的 ${selectedProducts.size} 個產品嗎？`)) return;
    try {
      await productService.bulkDeleteProducts(Array.from(selectedProducts));
      await fetchProducts();
      setSelectedProducts(new Set());
    } catch (err: any) {
      setError(err.message || '批量刪除失敗');
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(filteredProducts.map(p => p.product_id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  // Handle export CSV
  const handleExportCSV = () => {
    const headers = ['產品ID', '名稱', 'SKU', '類別', '價格', '庫存', '狀態'];
    const rows = filteredProducts.map(p => [
      p.product_id,
      p.name,
      p.sku,
      p.category || '',
      p.price.toString(),
      p.stock.toString(),
      stockStatusLabels[getStockStatus(p)],
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Handle create product
  const handleCreateProduct = async (productData: any) => {
    try {
      await productService.createProduct(productData);
      await fetchProducts();
      setShowCreateModal(false);
    } catch (err: any) {
      setError(err.message || '建立產品失敗');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-100 mb-2">產品管理</h1>
          <p className="text-gray-400 text-sm">管理您的產品庫存與資訊</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-medium uppercase tracking-[0.05em]"
          >
            新增產品
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-all text-sm font-medium uppercase tracking-[0.05em]"
          >
            匯出 CSV
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-4 bg-gray-800 rounded-xl border border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Category filter */}
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">類別</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">全部類別</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Active Status filter */}
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">狀態</label>
            <select
              value={isActiveFilter === undefined ? 'all' : isActiveFilter ? 'active' : 'inactive'}
              onChange={(e) => {
                const value = e.target.value;
                setIsActiveFilter(value === 'all' ? undefined : value === 'active');
                setFilters({ ...filters, page: 1 });
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500"
            >
              <option value="all">全部</option>
              <option value="active">啟用</option>
              <option value="inactive">停用</option>
            </select>
          </div>

          {/* Items per page */}
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">每頁顯示</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500"
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedProducts.size > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700 flex items-center gap-2">
            <span className="text-sm text-gray-400">已選取 {selectedProducts.size} 個產品</span>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
            >
              刪除選取
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-400">載入中...</div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-400">沒有找到產品</div>
        </div>
      ) : (
        <>
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">名稱</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">類別</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">價格</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">庫存</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">狀態</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredProducts.map((product) => {
                    const isEditing = editingProduct === product.product_id;
                    const stockStatus = getStockStatus(product);
                    const isSelected = selectedProducts.has(product.product_id);

                    return (
                      <tr key={product.product_id} className={isSelected ? 'bg-blue-500/10' : 'hover:bg-gray-700/30'}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newSelected = new Set(selectedProducts);
                              if (e.target.checked) {
                                newSelected.add(product.product_id);
                              } else {
                                newSelected.delete(product.product_id);
                              }
                              setSelectedProducts(newSelected);
                            }}
                            className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          {isEditing && editingField === 'name' ? (
                            <input
                              type="text"
                              value={editValues.name ?? product.name}
                              onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                              onBlur={() => saveEdit(product.product_id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(product.product_id);
                                if (e.key === 'Escape') cancelEditing();
                              }}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                              autoFocus
                            />
                          ) : (
                            <div
                              className="text-gray-100 cursor-pointer hover:text-blue-400"
                              onDoubleClick={() => startEditing(product.product_id, 'name', product.name)}
                            >
                              {product.name}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-300 text-sm">{product.sku}</td>
                        <td className="px-4 py-3">
                          {isEditing && editingField === 'category' ? (
                            <input
                              type="text"
                              value={editValues.category ?? product.category ?? ''}
                              onChange={(e) => setEditValues({ ...editValues, category: e.target.value })}
                              onBlur={() => saveEdit(product.product_id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(product.product_id);
                                if (e.key === 'Escape') cancelEditing();
                              }}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                              autoFocus
                            />
                          ) : (
                            <div
                              className="text-gray-300 text-sm cursor-pointer hover:text-blue-400"
                              onDoubleClick={() => startEditing(product.product_id, 'category', product.category)}
                            >
                              {product.category || '-'}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing && editingField === 'price' ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editValues.price ?? product.price}
                              onChange={(e) => setEditValues({ ...editValues, price: parseFloat(e.target.value) })}
                              onBlur={() => saveEdit(product.product_id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(product.product_id);
                                if (e.key === 'Escape') cancelEditing();
                              }}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                              autoFocus
                            />
                          ) : (
                            <div
                              className="text-gray-100 cursor-pointer hover:text-blue-400"
                              onDoubleClick={() => startEditing(product.product_id, 'price', product.price)}
                            >
                              ${product.price.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing && editingField === 'stock' ? (
                            <input
                              type="number"
                              value={editValues.stock ?? product.stock}
                              onChange={(e) => setEditValues({ ...editValues, stock: parseInt(e.target.value) })}
                              onBlur={() => saveEdit(product.product_id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(product.product_id);
                                if (e.key === 'Escape') cancelEditing();
                              }}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                              autoFocus
                            />
                          ) : (
                            <div
                              className="text-gray-100 cursor-pointer hover:text-blue-400"
                              onDoubleClick={() => startEditing(product.product_id, 'stock', product.stock)}
                            >
                              {product.stock}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-1 text-xs font-medium rounded"
                            style={{
                              backgroundColor: `${stockStatusColors[stockStatus]}20`,
                              color: stockStatusColors[stockStatus],
                            }}
                          >
                            {stockStatusLabels[stockStatus]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(product.product_id)}
                              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-all"
                            >
                              刪除
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              顯示第 {(filters.page - 1) * filters.limit + 1} - {Math.min(filters.page * filters.limit, totalProducts)} 項，共 {totalProducts} 項
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                disabled={filters.page === 1}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                上一頁
              </button>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page * filters.limit >= totalProducts}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                下一頁
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create Product Modal */}
      {showCreateModal && (
        <CreateProductModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProduct}
          categories={categories}
        />
      )}
    </div>
  );
};

// Create Product Modal Component
interface CreateProductModalProps {
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
  categories: string[];
}

const CreateProductModal = ({ onClose, onCreate, categories }: CreateProductModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sku: '',
    category: '',
    stock: '0',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreate({
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        sku: formData.sku,
        category: formData.category || null,
        stock: parseInt(formData.stock),
        currency: 'TWD', // Default currency
        image_url: null, // Can be added later via update
        is_active: true, // Default to active
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-gray-100 mb-4">新增產品</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">產品名稱 *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">SKU *</label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">價格 *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">類別</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              list="categories"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500"
            />
            <datalist id="categories">
              {categories.map(cat => <option key={cat} value={cat} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">庫存</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500"
              rows={3}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50"
            >
              {submitting ? '建立中...' : '建立'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Products;

