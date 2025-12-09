import { useState, useMemo } from 'react';
import { products as initialProducts, stockHistory, getStockStatus } from '../data/dashboardData';
import type { Product, StockStatus, StockChangeType } from '../types';
import { stockStatusLabels, stockStatusColors, stockChangeTypes } from '../types';

interface EditModalState {
  open: boolean;
  product: Product | null;
}

interface AdjustmentData {
  newStock: number;
  type: StockChangeType;
  reason: string;
}

const StockManagement = () => {
  const [productsData, setProductsData] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editModal, setEditModal] = useState<EditModalState>({ open: false, product: null });
  const [adjustmentData, setAdjustmentData] = useState<AdjustmentData>({
    newStock: 0,
    type: 'adjustment',
    reason: ''
  });

  const categories = [...new Set(productsData.map(p => p.category))];

  const filteredProducts = useMemo(() => {
    let filtered = [...productsData];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => 
        getStockStatus(product.stock, product.lowStockThreshold) === statusFilter
      );
    }

    return filtered;
  }, [productsData, searchTerm, categoryFilter, statusFilter]);

  // Stats
  const totalProducts = productsData.length;
  const lowStockCount = productsData.filter(p => 
    getStockStatus(p.stock, p.lowStockThreshold) === 'low_stock'
  ).length;
  const outOfStockCount = productsData.filter(p => p.stock === 0).length;
  const totalStockValue = productsData.reduce((sum, p) => sum + (p.stock * p.price), 0);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const openEditModal = (product: Product) => {
    setEditModal({ open: true, product });
    setAdjustmentData({
      newStock: product.stock,
      type: 'adjustment',
      reason: ''
    });
  };

  const closeEditModal = () => {
    setEditModal({ open: false, product: null });
    setAdjustmentData({ newStock: 0, type: 'adjustment', reason: '' });
  };

  const handleStockUpdate = () => {
    if (!editModal.product) return;

    const { product } = editModal;
    const { newStock, type, reason } = adjustmentData;

    if (newStock < 0) {
      alert('庫存數量不能為負數');
      return;
    }

    if (!reason.trim()) {
      alert('請輸入調整原因');
      return;
    }

    // Update product stock
    setProductsData(prev => prev.map(p => {
      if (p.id === product.id) {
        return { ...p, stock: parseInt(String(newStock)) };
      }
      return p;
    }));

    // In a real app, we would also add to stock history here
    console.log('Stock updated:', {
      productId: product.id,
      previousStock: product.stock,
      newStock: parseInt(String(newStock)),
      type,
      reason,
      timestamp: new Date().toISOString()
    });

    closeEditModal();
  };

  const getRecentHistory = (productId: number) => {
    return stockHistory
      .filter(h => h.productId === productId)
      .slice(0, 3);
  };

  const getStockBadgeClass = (status: StockStatus): string => {
    const colorMap: Record<StockStatus, string> = {
      in_stock: 'bg-green-500/15 text-green-400',
      low_stock: 'bg-yellow-500/15 text-yellow-400',
      out_of_stock: 'bg-red-500/15 text-red-400',
    };
    return `inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${colorMap[status]}`;
  };

  const getStockQtyClass = (status: StockStatus): string => {
    const colorMap: Record<StockStatus, string> = {
      in_stock: 'bg-green-500/15 text-green-400',
      low_stock: 'bg-yellow-500/15 text-yellow-400',
      out_of_stock: 'bg-red-500/15 text-red-400',
    };
    return `inline-flex items-center justify-center min-w-[50px] px-3 py-1 rounded-md font-bold text-sm ${colorMap[status]}`;
  };

  return (
    <div className="max-w-container">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-100 mb-2">庫存管理</h1>
          <p className="text-gray-400 text-sm">管理商品庫存數量與追蹤庫存變動</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:shadow-lg transition-all">
          <div className="text-3xl font-bold text-gray-100 mb-1">{totalProducts}</div>
          <div className="text-gray-400 text-sm tracking-[0.05em] uppercase">商品總數</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:shadow-lg transition-all">
          <div className="text-3xl font-bold text-gray-100 mb-1">{lowStockCount}</div>
          <div className="text-gray-400 text-sm tracking-[0.05em] uppercase">庫存不足</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:shadow-lg transition-all">
          <div className="text-3xl font-bold text-gray-100 mb-1">{outOfStockCount}</div>
          <div className="text-gray-400 text-sm tracking-[0.05em] uppercase">已售完</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:shadow-lg transition-all">
          <div className="text-3xl font-bold text-gray-100 mb-1">{formatCurrency(totalStockValue)}</div>
          <div className="text-gray-400 text-sm tracking-[0.05em] uppercase">庫存總價值</div>
        </div>
      </div>

      {/* Alert Banner */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="px-5 py-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-6 text-yellow-400">
          <span>
            目前有 <strong className="text-gray-100">{lowStockCount}</strong> 項商品庫存不足
            {outOfStockCount > 0 && <>, <strong className="text-gray-100">{outOfStockCount}</strong> 項已售完</>}
            ，請盡快補貨！
          </span>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100">商品庫存</h2>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
              placeholder="搜尋商品名稱或 SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">所有分類</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">所有狀態</option>
              <option value="in_stock">庫存充足</option>
              <option value="low_stock">庫存不足</option>
              <option value="out_of_stock">已售完</option>
            </select>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700/50">
                  <th className="text-left px-6 py-3.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">SKU</th>
                  <th className="text-left px-6 py-3.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">商品名稱</th>
                  <th className="text-left px-6 py-3.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">分類</th>
                  <th className="text-left px-6 py-3.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">單價</th>
                  <th className="text-left px-6 py-3.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">庫存數量</th>
                  <th className="text-left px-6 py-3.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">警戒值</th>
                  <th className="text-left px-6 py-3.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">狀態</th>
                  <th className="text-left px-6 py-3.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">庫存價值</th>
                  <th className="text-left px-6 py-3.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const status = getStockStatus(product.stock, product.lowStockThreshold);
                  return (
                    <tr 
                      key={product.id} 
                      className={`border-b border-gray-700 hover:bg-gray-700/30 transition-colors ${
                        status !== 'in_stock' ? 'bg-yellow-500/5' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <code className="bg-gray-700/50 px-2 py-1 rounded text-xs text-gray-400">{product.sku}</code>
                      </td>
                      <td className="px-6 py-4 text-gray-100 font-semibold">{product.name}</td>
                      <td className="px-6 py-4 text-gray-300">{product.category}</td>
                      <td className="px-6 py-4 text-gray-300">{formatCurrency(product.price)}</td>
                      <td className="px-6 py-4">
                        <span className={getStockQtyClass(status)}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{product.lowStockThreshold}</td>
                      <td className="px-6 py-4">
                        <span className={getStockBadgeClass(status)}>
                          {stockStatusLabels[status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{formatCurrency(product.stock * product.price)}</td>
                      <td className="px-6 py-4">
                        <button
                          className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                          onClick={() => openEditModal(product)}
                        >
                          調整
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <h3 className="text-lg text-gray-100 mb-2">沒有找到商品</h3>
            <p className="text-sm">請嘗試調整篩選條件</p>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {editModal.open && editModal.product && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeEditModal}>
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[85vh] overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-gray-100">調整庫存</h3>
              <button className="w-9 h-9 rounded-full bg-transparent text-gray-400 text-2xl flex items-center justify-center hover:bg-gray-700 hover:text-gray-100 transition-colors" onClick={closeEditModal}>×</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
              <div className="bg-gray-700/50 rounded-lg p-4 mb-5">
                <div className="flex justify-between items-center mb-2">
                  <code className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-400 font-mono">{editModal.product.sku}</code>
                  <span className={getStockBadgeClass(getStockStatus(editModal.product.stock, editModal.product.lowStockThreshold))}>
                    {stockStatusLabels[getStockStatus(editModal.product.stock, editModal.product.lowStockThreshold)]}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-100 mb-2">{editModal.product.name}</h4>
                <p className="text-gray-400 text-sm">
                  目前庫存：<strong className="text-gray-100 text-lg">{editModal.product.stock}</strong> 件
                </p>
              </div>

              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-400">調整類型</label>
                <select
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-blue-500"
                  value={adjustmentData.type}
                  onChange={(e) => setAdjustmentData(prev => ({ ...prev, type: e.target.value as StockChangeType }))}
                >
                  {Object.entries(stockChangeTypes).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-400">新庫存數量</label>
                <div className="flex items-center gap-2">
                  <button
                    className="w-11 h-11 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg text-xl font-semibold hover:bg-gray-600 hover:border-blue-500 transition-colors"
                    onClick={() => setAdjustmentData(prev => ({ 
                      ...prev, 
                      newStock: Math.max(0, prev.newStock - 1) 
                    }))}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 text-xl font-bold text-center focus:outline-none focus:border-blue-500"
                    value={adjustmentData.newStock}
                    onChange={(e) => setAdjustmentData(prev => ({ 
                      ...prev, 
                      newStock: parseInt(e.target.value) || 0 
                    }))}
                    min="0"
                  />
                  <button
                    className="w-11 h-11 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg text-xl font-semibold hover:bg-gray-600 hover:border-blue-500 transition-colors"
                    onClick={() => setAdjustmentData(prev => ({ 
                      ...prev, 
                      newStock: prev.newStock + 1 
                    }))}
                  >
                    +
                  </button>
                </div>
                <div className="h-6 mt-2 text-center">
                  {adjustmentData.newStock !== editModal.product.stock && (
                    <span className={`text-sm font-semibold px-3 py-1 rounded-md ${
                      adjustmentData.newStock > editModal.product.stock 
                        ? 'bg-green-500/15 text-green-400' 
                        : 'bg-red-500/15 text-red-400'
                    }`}>
                      {adjustmentData.newStock > editModal.product.stock ? '+' : ''}
                      {adjustmentData.newStock - editModal.product.stock} 件
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-400">調整原因 *</label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-blue-500 resize-y min-h-[80px]"
                  placeholder="請輸入調整原因..."
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Recent History */}
              {getRecentHistory(editModal.product.id).length > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-700">
                  <h5 className="text-xs text-gray-400 mb-3 uppercase tracking-wider">最近異動記錄</h5>
                  {getRecentHistory(editModal.product.id).map(h => (
                    <div key={h.id} className="flex items-center gap-3 py-2 text-sm border-b border-gray-700 last:border-0">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        h.type === 'increase' ? 'bg-green-500/15 text-green-400' :
                        h.type === 'decrease' ? 'bg-red-500/15 text-red-400' :
                        h.type === 'adjustment' ? 'bg-blue-500/15 text-blue-400' :
                        h.type === 'return' ? 'bg-purple-500/15 text-purple-400' :
                        'bg-yellow-500/15 text-yellow-400'
                      }`}>
                        {stockChangeTypes[h.type]}
                      </span>
                      <span className="text-gray-100 font-medium">
                        {h.previousStock} → {h.newStock}
                      </span>
                      <span className="ml-auto text-gray-500 text-xs">
                        {new Date(h.createdAt).toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
              <button className="px-4 py-2 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors" onClick={closeEditModal}>
                取消
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors" onClick={handleStockUpdate}>
                確認調整
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
