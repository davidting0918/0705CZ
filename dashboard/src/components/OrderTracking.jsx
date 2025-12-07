import { useState, useMemo } from 'react';
import { orders as initialOrders, statusLabels, statusColors } from '../data/dashboardData';
import './OrderTracking.css';

function OrderTracking() {
  const [ordersData, setOrdersData] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
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

  const filteredOrders = useMemo(() => {
    let filtered = [...ordersData];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerPhone.includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    return filtered;
  }, [ordersData, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const pendingCount = ordersData.filter(o => o.status === 'pending').length;
  const processingCount = ordersData.filter(o => o.status === 'processing').length;
  const shippedCount = ordersData.filter(o => o.status === 'shipped').length;
  const deliveredCount = ordersData.filter(o => o.status === 'delivered').length;

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrdersData(prev => prev.map(order => {
      if (order.id === orderId) {
        return { ...order, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return order;
    }));
    setShowStatusModal(false);
    setOrderToUpdate(null);
  };

  const openStatusModal = (order) => {
    setOrderToUpdate(order);
    setShowStatusModal(true);
  };

  const getNextStatus = (currentStatus) => {
    const flow = {
      pending: 'processing',
      processing: 'shipped',
      shipped: 'delivered'
    };
    return flow[currentStatus];
  };

  return (
    <div className="order-tracking">
      <div className="page-header">
        <h1>訂單追蹤</h1>
        <p>追蹤與管理所有訂單狀態</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon yellow">⏳</div>
          </div>
          <div className="stat-card-value">{pendingCount}</div>
          <div className="stat-card-label">待處理</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon blue">🔄</div>
          </div>
          <div className="stat-card-value">{processingCount}</div>
          <div className="stat-card-label">處理中</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon purple">🚚</div>
          </div>
          <div className="stat-card-value">{shippedCount}</div>
          <div className="stat-card-label">已出貨</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">✓</div>
          </div>
          <div className="stat-card-value">{deliveredCount}</div>
          <div className="stat-card-label">已送達</div>
        </div>
      </div>

      <div className="data-table-container">
        <div className="table-header">
          <h2>訂單列表</h2>
          <div className="table-filters">
            <input
              type="text"
              className="filter-input"
              placeholder="搜尋訂單編號、客戶名稱..."
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
              <option value="pending">待處理</option>
              <option value="processing">處理中</option>
              <option value="shipped">已出貨</option>
              <option value="delivered">已送達</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
        </div>

        {paginatedOrders.length > 0 ? (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>訂單編號</th>
                  <th>客戶</th>
                  <th>商品數</th>
                  <th>金額</th>
                  <th>狀態</th>
                  <th>建立時間</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map(order => (
                  <tr key={order.id}>
                    <td><strong>{order.id}</strong></td>
                    <td>
                      <div className="customer-info-cell">
                        <span className="customer-name">{order.customerName}</span>
                        <span className="customer-phone">{order.customerPhone}</span>
                      </div>
                    </td>
                    <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)} 件</td>
                    <td className="amount-cell">{formatCurrency(order.total)}</td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          查看
                        </button>
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openStatusModal(order)}
                          >
                            更新
                          </button>
                        )}
                      </div>
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
            <h3>沒有找到訂單</h3>
            <p>請嘗試調整篩選條件</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>訂單詳情 - {selectedOrder.id}</h3>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="order-status-header">
                <span 
                  className={`status-badge ${selectedOrder.status}`}
                  style={{ 
                    fontSize: '14px', 
                    padding: '8px 16px',
                    boxShadow: `0 0 20px ${statusColors[selectedOrder.status]}40`
                  }}
                >
                  {statusLabels[selectedOrder.status]}
                </span>
              </div>

              <div className="order-timeline">
                {['pending', 'processing', 'shipped', 'delivered'].map((step, index) => {
                  const stepOrder = ['pending', 'processing', 'shipped', 'delivered'];
                  const currentIndex = stepOrder.indexOf(selectedOrder.status);
                  const isCompleted = index <= currentIndex && selectedOrder.status !== 'cancelled';
                  const isCurrent = step === selectedOrder.status;
                  
                  return (
                    <div key={step} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                      <div className="timeline-dot" style={{ backgroundColor: isCompleted ? statusColors[step] : 'var(--border-color)' }}>
                        {isCompleted && '✓'}
                      </div>
                      <span className="timeline-label">{statusLabels[step]}</span>
                    </div>
                  );
                })}
              </div>

              <div className="detail-list">
                <div className="detail-item">
                  <span className="detail-label">客戶名稱</span>
                  <span className="detail-value">{selectedOrder.customerName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">電話</span>
                  <span className="detail-value">{selectedOrder.customerPhone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selectedOrder.customerEmail}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">收件地址</span>
                  <span className="detail-value">{selectedOrder.shippingAddress}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">付款方式</span>
                  <span className="detail-value">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">建立時間</span>
                  <span className="detail-value">{formatDate(selectedOrder.createdAt)}</span>
                </div>
                {selectedOrder.notes && (
                  <div className="detail-item">
                    <span className="detail-label">備註</span>
                    <span className="detail-value">{selectedOrder.notes}</span>
                  </div>
                )}
              </div>

              <h4 style={{ marginTop: '24px', marginBottom: '12px', color: 'var(--text-primary)' }}>
                訂購商品
              </h4>
              <div className="order-items-list">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span>
                      <span className="order-item-name">{item.productName}</span>
                      <span className="order-item-qty">× {item.quantity}</span>
                    </span>
                    <span className="order-item-price">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>小計</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>運費</span>
                  <span>{selectedOrder.shipping === 0 ? '免運' : formatCurrency(selectedOrder.shipping)}</span>
                </div>
                <div className="summary-row total">
                  <span>總計</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    setSelectedOrder(null);
                    openStatusModal(selectedOrder);
                  }}
                >
                  更新狀態
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && orderToUpdate && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>更新訂單狀態</h3>
              <button className="modal-close" onClick={() => setShowStatusModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="status-update-info">
                訂單 <strong>{orderToUpdate.id}</strong> 目前狀態：
                <span className={`status-badge ${orderToUpdate.status}`} style={{ marginLeft: '8px' }}>
                  {statusLabels[orderToUpdate.status]}
                </span>
              </p>
              
              <div className="status-options">
                <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>選擇新狀態：</p>
                {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                  <button
                    key={status}
                    className={`status-option-btn ${status === orderToUpdate.status ? 'current' : ''}`}
                    onClick={() => handleStatusUpdate(orderToUpdate.id, status)}
                    disabled={status === orderToUpdate.status}
                    style={{ 
                      borderColor: statusColors[status],
                      '--status-color': statusColors[status]
                    }}
                  >
                    <span className="status-dot" style={{ backgroundColor: statusColors[status] }}></span>
                    {statusLabels[status]}
                    {status === getNextStatus(orderToUpdate.status) && (
                      <span className="recommended-badge">建議</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderTracking;

