import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  stockHistory, 
  products,
  stockChangeTypes 
} from '../data/dashboardData';
import './StockHistory.css';

function StockHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const itemsPerPage = 15;

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

  const filteredHistory = useMemo(() => {
    let filtered = [...stockHistory];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        record.id.toLowerCase().includes(term) ||
        record.productName.toLowerCase().includes(term) ||
        record.productSku.toLowerCase().includes(term) ||
        record.operator.toLowerCase().includes(term)
      );
    }

    // Product filter
    if (productFilter !== 'all') {
      filtered = filtered.filter(record => record.productId === parseInt(productFilter));
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(record => record.type === typeFilter);
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
      
      filtered = filtered.filter(record => new Date(record.createdAt) >= filterDate);
    }

    return filtered;
  }, [searchTerm, productFilter, typeFilter, dateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const totalChanges = filteredHistory.length;
  const increaseCount = filteredHistory.filter(h => h.type === 'increase').length;
  const decreaseCount = filteredHistory.filter(h => h.type === 'decrease').length;
  const adjustmentCount = filteredHistory.filter(h => 
    h.type === 'adjustment' || h.type === 'return' || h.type === 'damage'
  ).length;

  const getChangeAmount = (record) => {
    const diff = record.newStock - record.previousStock;
    return diff;
  };

  return (
    <div className="stock-history">
      <div className="page-header">
        <div>
          <h1>庫存歷史</h1>
          <p>查看所有庫存變動記錄</p>
        </div>
        <Link to="/stock" className="btn btn-secondary">
          ← 返回庫存管理
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon blue">📊</div>
          </div>
          <div className="stat-card-value">{totalChanges}</div>
          <div className="stat-card-label">總異動記錄</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">📥</div>
          </div>
          <div className="stat-card-value">{increaseCount}</div>
          <div className="stat-card-label">進貨次數</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon red">📤</div>
          </div>
          <div className="stat-card-value">{decreaseCount}</div>
          <div className="stat-card-label">出貨次數</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon purple">🔄</div>
          </div>
          <div className="stat-card-value">{adjustmentCount}</div>
          <div className="stat-card-label">其他調整</div>
        </div>
      </div>

      <div className="data-table-container">
        <div className="table-header">
          <h2>異動記錄</h2>
          <div className="table-filters">
            <input
              type="text"
              className="filter-input"
              placeholder="搜尋記錄編號、商品、操作人員..."
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
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">所有類型</option>
              {Object.entries(stockChangeTypes).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
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

        {paginatedHistory.length > 0 ? (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>記錄編號</th>
                  <th>商品</th>
                  <th>類型</th>
                  <th>變動</th>
                  <th>庫存變化</th>
                  <th>原因</th>
                  <th>操作人員</th>
                  <th>時間</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map(record => {
                  const changeAmount = getChangeAmount(record);
                  return (
                    <tr key={record.id}>
                      <td><code>{record.id}</code></td>
                      <td>
                        <div className="product-cell">
                          <span className="product-name">{record.productName}</span>
                          <span className="product-sku">{record.productSku}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`change-type-badge ${record.type}`}>
                          {stockChangeTypes[record.type]}
                        </span>
                      </td>
                      <td>
                        <span className={`change-amount ${changeAmount >= 0 ? 'positive' : 'negative'}`}>
                          {changeAmount >= 0 ? '+' : ''}{changeAmount}
                        </span>
                      </td>
                      <td>
                        <span className="stock-change">
                          {record.previousStock} → {record.newStock}
                        </span>
                      </td>
                      <td className="reason-cell">{record.reason}</td>
                      <td>{record.operator}</td>
                      <td className="date-cell">{formatDate(record.createdAt)}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedRecord(record)}
                        >
                          查看
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
            <h3>沒有找到記錄</h3>
            <p>請嘗試調整篩選條件</p>
          </div>
        )}
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>異動詳情 - {selectedRecord.id}</h3>
              <button className="modal-close" onClick={() => setSelectedRecord(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="record-type-header">
                <span className={`change-type-badge large ${selectedRecord.type}`}>
                  {stockChangeTypes[selectedRecord.type]}
                </span>
                <span className={`change-amount large ${getChangeAmount(selectedRecord) >= 0 ? 'positive' : 'negative'}`}>
                  {getChangeAmount(selectedRecord) >= 0 ? '+' : ''}{getChangeAmount(selectedRecord)} 件
                </span>
              </div>

              <div className="detail-list">
                <div className="detail-item">
                  <span className="detail-label">商品名稱</span>
                  <span className="detail-value">{selectedRecord.productName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">商品編號</span>
                  <span className="detail-value"><code>{selectedRecord.productSku}</code></span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">庫存變化</span>
                  <span className="detail-value">
                    <span className="stock-flow">
                      <span className="old-stock">{selectedRecord.previousStock}</span>
                      <span className="arrow">→</span>
                      <span className="new-stock">{selectedRecord.newStock}</span>
                    </span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">變動原因</span>
                  <span className="detail-value">{selectedRecord.reason}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">操作人員</span>
                  <span className="detail-value">{selectedRecord.operator}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">操作時間</span>
                  <span className="detail-value">{formatDate(selectedRecord.createdAt)}</span>
                </div>
                {selectedRecord.notes && (
                  <div className="detail-item">
                    <span className="detail-label">備註</span>
                    <span className="detail-value">{selectedRecord.notes}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedRecord(null)}>
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockHistory;

