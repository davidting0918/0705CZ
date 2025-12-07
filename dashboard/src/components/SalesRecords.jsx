import { useState, useMemo } from 'react';
import { salesRecords, products } from '../data/dashboardData';
import './SalesRecords.css';

function SalesRecords() {
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState(null);
  const itemsPerPage = 10;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRecords = useMemo(() => {
    let filtered = [...salesRecords];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sale => 
        sale.id.toLowerCase().includes(term) ||
        sale.orderId.toLowerCase().includes(term) ||
        sale.customerName.toLowerCase().includes(term)
      );
    }

    // Product filter
    if (productFilter !== 'all') {
      filtered = filtered.filter(sale =>
        sale.items.some(item => item.productId === parseInt(productFilter))
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(sale => new Date(sale.completedAt) >= filterDate);
      }
    }

    return filtered;
  }, [searchTerm, productFilter, dateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const totalRevenue = filteredRecords.reduce((sum, sale) => sum + sale.total, 0);
  const totalItems = filteredRecords.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  return (
    <div className="sales-records">
      <div className="page-header">
        <h1>銷售記錄</h1>
        <p>查看所有已完成的銷售交易記錄</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">💰</div>
          </div>
          <div className="stat-card-value">{formatCurrency(totalRevenue)}</div>
          <div className="stat-card-label">篩選後總營收</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon blue">🧾</div>
          </div>
          <div className="stat-card-value">{filteredRecords.length}</div>
          <div className="stat-card-label">銷售筆數</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon purple">📦</div>
          </div>
          <div className="stat-card-value">{totalItems}</div>
          <div className="stat-card-label">售出商品數</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon yellow">📊</div>
          </div>
          <div className="stat-card-value">
            {filteredRecords.length > 0 ? formatCurrency(totalRevenue / filteredRecords.length) : '$0'}
          </div>
          <div className="stat-card-label">平均客單價</div>
        </div>
      </div>

      <div className="data-table-container">
        <div className="table-header">
          <h2>銷售明細</h2>
          <div className="table-filters">
            <input
              type="text"
              className="filter-input"
              placeholder="搜尋銷售編號、訂單或客戶..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <select
              className="filter-select"
              value={productFilter}
              onChange={(e) => {
                setProductFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">所有商品</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">所有時間</option>
              <option value="today">今天</option>
              <option value="week">最近7天</option>
              <option value="month">最近30天</option>
            </select>
          </div>
        </div>

        {paginatedRecords.length > 0 ? (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>銷售編號</th>
                  <th>訂單編號</th>
                  <th>客戶</th>
                  <th>商品數</th>
                  <th>付款方式</th>
                  <th>金額</th>
                  <th>完成時間</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map(sale => (
                  <tr key={sale.id}>
                    <td><strong>{sale.id}</strong></td>
                    <td>{sale.orderId}</td>
                    <td>{sale.customerName}</td>
                    <td>{sale.items.reduce((sum, item) => sum + item.quantity, 0)} 件</td>
                    <td>{sale.paymentMethod}</td>
                    <td className="amount-cell">{formatCurrency(sale.total)}</td>
                    <td>{formatDate(sale.completedAt)}</td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedSale(sale)}
                      >
                        查看
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  上一頁
                </button>
                <span className="pagination-info">
                  第 {currentPage} / {totalPages} 頁
                </span>
                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  下一頁
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>沒有找到銷售記錄</h3>
            <p>請嘗試調整篩選條件</p>
          </div>
        )}
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="modal-overlay" onClick={() => setSelectedSale(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>銷售詳情 - {selectedSale.id}</h3>
              <button className="modal-close" onClick={() => setSelectedSale(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-list">
                <div className="detail-item">
                  <span className="detail-label">訂單編號</span>
                  <span className="detail-value">{selectedSale.orderId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">客戶名稱</span>
                  <span className="detail-value">{selectedSale.customerName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">付款方式</span>
                  <span className="detail-value">{selectedSale.paymentMethod}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">完成時間</span>
                  <span className="detail-value">{formatDate(selectedSale.completedAt)}</span>
                </div>
              </div>

              <h4 style={{ marginTop: '24px', marginBottom: '12px', color: 'var(--text-primary)' }}>
                購買商品
              </h4>
              <div className="order-items-list">
                {selectedSale.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span>
                      <span className="order-item-name">{item.productName}</span>
                      <span className="order-item-qty">× {item.quantity}</span>
                    </span>
                    <span className="order-item-price">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="sale-summary">
                <div className="summary-row">
                  <span>小計</span>
                  <span>{formatCurrency(selectedSale.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>運費</span>
                  <span>{selectedSale.shipping === 0 ? '免運' : formatCurrency(selectedSale.shipping)}</span>
                </div>
                <div className="summary-row total">
                  <span>總計</span>
                  <span>{formatCurrency(selectedSale.total)}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedSale(null)}>
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesRecords;

