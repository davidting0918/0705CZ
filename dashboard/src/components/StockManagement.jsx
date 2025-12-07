import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  products as initialProducts, 
  stockHistory,
  getStockStatus, 
  stockStatusLabels, 
  stockStatusColors,
  stockChangeTypes
} from '../data/dashboardData';
import './StockManagement.css';

function StockManagement() {
  const [productsData, setProductsData] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editModal, setEditModal] = useState({ open: false, product: null });
  const [adjustmentData, setAdjustmentData] = useState({
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const openEditModal = (product) => {
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
        return { ...p, stock: parseInt(newStock) };
      }
      return p;
    }));

    // In a real app, we would also add to stock history here
    console.log('Stock updated:', {
      productId: product.id,
      previousStock: product.stock,
      newStock: parseInt(newStock),
      type,
      reason,
      timestamp: new Date().toISOString()
    });

    closeEditModal();
  };

  const getRecentHistory = (productId) => {
    return stockHistory
      .filter(h => h.productId === productId)
      .slice(0, 3);
  };

  return (
    <div className="stock-management">
      <div className="page-header">
        <div>
          <h1>庫存管理</h1>
          <p>管理商品庫存數量與追蹤庫存變動</p>
        </div>
        <Link to="/stock/history" className="btn btn-secondary">
          📋 庫存歷史
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon blue">📦</div>
          </div>
          <div className="stat-card-value">{totalProducts}</div>
          <div className="stat-card-label">商品總數</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon yellow">⚠️</div>
          </div>
          <div className="stat-card-value">{lowStockCount}</div>
          <div className="stat-card-label">庫存不足</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon red">🚫</div>
          </div>
          <div className="stat-card-value">{outOfStockCount}</div>
          <div className="stat-card-label">已售完</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">💰</div>
          </div>
          <div className="stat-card-value">{formatCurrency(totalStockValue)}</div>
          <div className="stat-card-label">庫存總價值</div>
        </div>
      </div>

      {/* Alert Banner */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="stock-alert-banner">
          <span className="alert-icon">⚠️</span>
          <span>
            目前有 <strong>{lowStockCount}</strong> 項商品庫存不足
            {outOfStockCount > 0 && <>, <strong>{outOfStockCount}</strong> 項已售完</>}
            ，請盡快補貨！
          </span>
        </div>
      )}

      <div className="data-table-container">
        <div className="table-header">
          <h2>商品庫存</h2>
          <div className="table-filters">
            <input
              type="text"
              className="filter-input"
              placeholder="搜尋商品名稱或 SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">所有分類</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              className="filter-select"
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
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>商品名稱</th>
                <th>分類</th>
                <th>單價</th>
                <th>庫存數量</th>
                <th>警戒值</th>
                <th>狀態</th>
                <th>庫存價值</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const status = getStockStatus(product.stock, product.lowStockThreshold);
                return (
                  <tr key={product.id} className={status !== 'in_stock' ? 'alert-row' : ''}>
                    <td><code>{product.sku}</code></td>
                    <td><strong>{product.name}</strong></td>
                    <td>{product.category}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>
                      <span className={`stock-qty ${status}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="threshold-cell">{product.lowStockThreshold}</td>
                    <td>
                      <span 
                        className="stock-status-badge"
                        style={{ 
                          backgroundColor: `${stockStatusColors[status]}20`,
                          color: stockStatusColors[status]
                        }}
                      >
                        {stockStatusLabels[status]}
                      </span>
                    </td>
                    <td>{formatCurrency(product.stock * product.price)}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
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
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>沒有找到商品</h3>
            <p>請嘗試調整篩選條件</p>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {editModal.open && editModal.product && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal stock-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>調整庫存</h3>
              <button className="modal-close" onClick={closeEditModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="product-info-card">
                <div className="product-info-header">
                  <span className="product-sku">{editModal.product.sku}</span>
                  <span 
                    className="stock-status-badge"
                    style={{ 
                      backgroundColor: `${stockStatusColors[getStockStatus(editModal.product.stock, editModal.product.lowStockThreshold)]}20`,
                      color: stockStatusColors[getStockStatus(editModal.product.stock, editModal.product.lowStockThreshold)]
                    }}
                  >
                    {stockStatusLabels[getStockStatus(editModal.product.stock, editModal.product.lowStockThreshold)]}
                  </span>
                </div>
                <h4>{editModal.product.name}</h4>
                <p className="current-stock">
                  目前庫存：<strong>{editModal.product.stock}</strong> 件
                </p>
              </div>

              <div className="form-group">
                <label>調整類型</label>
                <select
                  className="form-input"
                  value={adjustmentData.type}
                  onChange={(e) => setAdjustmentData(prev => ({ ...prev, type: e.target.value }))}
                >
                  {Object.entries(stockChangeTypes).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>新庫存數量</label>
                <div className="stock-input-group">
                  <button
                    className="stock-btn"
                    onClick={() => setAdjustmentData(prev => ({ 
                      ...prev, 
                      newStock: Math.max(0, prev.newStock - 1) 
                    }))}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className="form-input stock-input"
                    value={adjustmentData.newStock}
                    onChange={(e) => setAdjustmentData(prev => ({ 
                      ...prev, 
                      newStock: parseInt(e.target.value) || 0 
                    }))}
                    min="0"
                  />
                  <button
                    className="stock-btn"
                    onClick={() => setAdjustmentData(prev => ({ 
                      ...prev, 
                      newStock: prev.newStock + 1 
                    }))}
                  >
                    +
                  </button>
                </div>
                <div className="stock-change-indicator">
                  {adjustmentData.newStock !== editModal.product.stock && (
                    <span className={adjustmentData.newStock > editModal.product.stock ? 'increase' : 'decrease'}>
                      {adjustmentData.newStock > editModal.product.stock ? '+' : ''}
                      {adjustmentData.newStock - editModal.product.stock} 件
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>調整原因 *</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="請輸入調整原因..."
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Recent History */}
              {getRecentHistory(editModal.product.id).length > 0 && (
                <div className="recent-history">
                  <h5>最近異動記錄</h5>
                  {getRecentHistory(editModal.product.id).map(h => (
                    <div key={h.id} className="history-item-mini">
                      <span className={`change-type ${h.type}`}>
                        {stockChangeTypes[h.type]}
                      </span>
                      <span className="change-detail">
                        {h.previousStock} → {h.newStock}
                      </span>
                      <span className="change-date">
                        {new Date(h.createdAt).toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeEditModal}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleStockUpdate}>
                確認調整
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockManagement;

