import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import SalesRecords from './components/SalesRecords';
import CustomerList from './components/CustomerList';
import OrderTracking from './components/OrderTracking';
import StockManagement from './components/StockManagement';
import StockHistory from './components/StockHistory';
import './App.css';

function App() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/sales" element={<SalesRecords />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/orders" element={<OrderTracking />} />
          <Route path="/stock" element={<StockManagement />} />
          <Route path="/stock/history" element={<StockHistory />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

