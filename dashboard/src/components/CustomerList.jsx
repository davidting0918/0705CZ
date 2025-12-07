import { useState, useMemo } from 'react';
import { customers, orders, customerStatusLabels } from '../data/dashboardData';
import './CustomerList.css';

function CustomerList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
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
      day: 'numeric'
    });
  };

  const getCustomerOrders = (customerId) => {
    return orders.filter(order => order.customerId === customerId);
  };

  const filteredCustomers = useMemo(() => {
    let filtered = [...customers];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.phone.includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter);
    }

    // Sort by total spent
    filtered.sort((a, b) => b.totalSpent - a.totalSpent);

    return filtered;
  }, [searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const totalSpent = filteredCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const vipCount = customers.filter(c => c.status === 'vip').length;
  const newCount = customers.filter(c => c.status === 'new').length;

  return (
    <div className="customer-list">
      <div className="page-header">
        <h1>客戶管理</h1>
        <p>管理您的客戶資料與訂單歷史</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon blue">👥</div>
          </div>
          <div className="stat-card-value">{customers.length}</div>
          <div className="stat-card-label">總客戶數</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon purple">⭐</div>
          </div>
          <div className="stat-card-value">{vipCount}</div>
          <div className="stat-card-label">VIP 客戶</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">🆕</div>
          </div>
          <div className="stat-card-value">{newCount}</div>
          <div className="stat-card-label">新客戶</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon yellow">💵</div>
          </div>
          <div className="stat-card-value">{formatCurrency(totalSpent)}</div>
          <div className="stat-card-label">篩選後總消費</div>
        </div>
      </div>

      <div className="data-table-container">
        <div className="table-header">
          <h2>客戶列表</h2>
          <div className="table-filters">
            <input
              type="text"
              className="filter-input"
              placeholder="搜尋姓名、Email、電話..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">所有狀態</option>
              <option value="vip">VIP</option>
              <option value="active">活躍</option>
              <option value="new">新客戶</option>
            </select>
          </div>
        </div>

        {paginatedCustomers.length > 0 ? (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>客戶</th>
                  <th>聯絡資訊</th>
                  <th>狀態</th>
                  <th>訂單數</th>
                  <th>總消費</th>
                  <th>加入日期</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-name-cell">
                        <div className="customer-avatar">
                          {customer.name.charAt(0)}
                        </div>
                        <strong>{customer.name}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <span>{customer.email}</span>
                        <span className="phone">{customer.phone}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${customer.status}`}>
                        {customerStatusLabels[customer.status]}
                      </span>
                    </td>
                    <td>{customer.totalOrders} 筆</td>
                    <td className="amount-cell">{formatCurrency(customer.totalSpent)}</td>
                    <td>{formatDate(customer.joinDate)}</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedCustomer(customer)}
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
            <h3>沒有找到客戶</h3>
            <p>請嘗試調整篩選條件</p>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal customer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>客戶詳情</h3>
              <button className="modal-close" onClick={() => setSelectedCustomer(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="customer-profile">
                <div className="customer-avatar-large">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div className="customer-profile-info">
                  <h2>{selectedCustomer.name}</h2>
                  <span className={`status-badge ${selectedCustomer.status}`}>
                    {customerStatusLabels[selectedCustomer.status]}
                  </span>
                </div>
              </div>

              <div className="detail-list">
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selectedCustomer.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">電話</span>
                  <span className="detail-value">{selectedCustomer.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">地址</span>
                  <span className="detail-value">{selectedCustomer.address}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">加入日期</span>
                  <span className="detail-value">{formatDate(selectedCustomer.joinDate)}</span>
                </div>
              </div>

              <div className="customer-stats-row">
                <div className="customer-stat">
                  <span className="stat-number">{selectedCustomer.totalOrders}</span>
                  <span className="stat-text">總訂單數</span>
                </div>
                <div className="customer-stat">
                  <span className="stat-number">{formatCurrency(selectedCustomer.totalSpent)}</span>
                  <span className="stat-text">總消費金額</span>
                </div>
                <div className="customer-stat">
                  <span className="stat-number">
                    {selectedCustomer.totalOrders > 0 
                      ? formatCurrency(selectedCustomer.totalSpent / selectedCustomer.totalOrders) 
                      : '$0'}
                  </span>
                  <span className="stat-text">平均客單價</span>
                </div>
              </div>

              <h4 style={{ marginTop: '24px', marginBottom: '12px', color: 'var(--text-primary)' }}>
                訂單歷史
              </h4>
              <div className="customer-orders-list">
                {getCustomerOrders(selectedCustomer.id).slice(0, 5).map(order => (
                  <div key={order.id} className="customer-order-item">
                    <div className="order-info">
                      <span className="order-id">{order.id}</span>
                      <span className="order-date">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="order-right">
                      <span className="order-amount">{formatCurrency(order.total)}</span>
                      <span className={`status-badge ${order.status}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                        {order.status === 'pending' ? '待處理' :
                         order.status === 'processing' ? '處理中' :
                         order.status === 'shipped' ? '已出貨' :
                         order.status === 'delivered' ? '已送達' : '已取消'}
                      </span>
                    </div>
                  </div>
                ))}
                {getCustomerOrders(selectedCustomer.id).length === 0 && (
                  <p className="no-orders">此客戶尚無訂單記錄</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedCustomer(null)}>
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerList;

