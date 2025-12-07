import { Link } from 'react-router-dom';
import { getDashboardStats, orders, statusLabels } from '../data/dashboardData';
import './DashboardHome.css';

function DashboardHome() {
  const stats = getDashboardStats();
  const recentOrders = orders.slice(0, 8);

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-home">
      <div className="page-header">
        <h1>總覽</h1>
        <p>歡迎回來！這是您店鋪的最新狀態。</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon blue">💵</div>
          </div>
          <div className="stat-card-value">{formatCurrency(stats.totalRevenue)}</div>
          <div className="stat-card-label">總營業額</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">📦</div>
          </div>
          <div className="stat-card-value">{stats.totalOrders}</div>
          <div className="stat-card-label">總訂單數</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon yellow">⏳</div>
          </div>
          <div className="stat-card-value">{stats.pendingOrders}</div>
          <div className="stat-card-label">待處理訂單</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon purple">👥</div>
          </div>
          <div className="stat-card-value">{stats.activeCustomers}</div>
          <div className="stat-card-label">活躍客戶</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="recent-orders-card">
          <div className="card-header">
            <h3>最近訂單</h3>
            <Link to="/orders" className="btn btn-secondary btn-sm">
              查看全部
            </Link>
          </div>
          {recentOrders.map(order => (
            <div key={order.id} className="recent-order-item">
              <div className="recent-order-info">
                <h4>{order.id}</h4>
                <p>{order.customerName} · {formatDate(order.createdAt)}</p>
              </div>
              <div className="recent-order-amount">
                <div className="amount">{formatCurrency(order.total)}</div>
                <span className={`status-badge ${order.status}`}>
                  {statusLabels[order.status]}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="quick-stats-card">
          <div className="card-header">
            <h3>快速統計</h3>
          </div>
          <div className="quick-stats-content">
            <div className="quick-stat-item">
              <div className="quick-stat-icon green">✓</div>
              <div className="quick-stat-info">
                <span className="quick-stat-value">{stats.completedOrders}</span>
                <span className="quick-stat-label">已完成訂單</span>
              </div>
            </div>
            <div className="quick-stat-item">
              <div className="quick-stat-icon blue">🔄</div>
              <div className="quick-stat-info">
                <span className="quick-stat-value">{stats.processingOrders}</span>
                <span className="quick-stat-label">處理中訂單</span>
              </div>
            </div>
            <div className="quick-stat-item">
              <div className="quick-stat-icon purple">⭐</div>
              <div className="quick-stat-info">
                <span className="quick-stat-value">{stats.vipCustomers}</span>
                <span className="quick-stat-label">VIP 客戶</span>
              </div>
            </div>
            <div className="quick-stat-item">
              <div className="quick-stat-icon yellow">👤</div>
              <div className="quick-stat-info">
                <span className="quick-stat-value">{stats.totalCustomers}</span>
                <span className="quick-stat-label">總客戶數</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;

