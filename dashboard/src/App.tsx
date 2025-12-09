import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import OrderTracking from './components/OrderTracking';
import StockManagement from './components/StockManagement';
import Settings from './components/Settings';

function App() {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-6 bg-gray-900 min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/orders" replace />} />
          <Route path="/orders" element={<OrderTracking />} />
          <Route path="/stock" element={<StockManagement />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/orders" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
