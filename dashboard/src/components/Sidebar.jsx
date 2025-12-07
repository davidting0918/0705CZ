import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🏪</span>
          <span className="logo-text">0705CZ</span>
        </div>
        <span className="logo-subtitle">Staff Dashboard</span>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-title">主選單</span>
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <span className="nav-icon">📊</span>
            <span className="nav-label">總覽</span>
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📦</span>
            <span className="nav-label">訂單追蹤</span>
          </NavLink>
          <NavLink to="/sales" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">💰</span>
            <span className="nav-label">銷售記錄</span>
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">👥</span>
            <span className="nav-label">客戶管理</span>
          </NavLink>
          <NavLink to="/stock" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📋</span>
            <span className="nav-label">庫存管理</span>
          </NavLink>
        </div>
        
        <div className="nav-section">
          <span className="nav-section-title">設定</span>
          <div className="nav-item disabled">
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">系統設定</span>
            <span className="nav-badge">即將推出</span>
          </div>
        </div>
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">👤</div>
          <div className="user-details">
            <span className="user-name">管理員</span>
            <span className="user-role">Store Manager</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

