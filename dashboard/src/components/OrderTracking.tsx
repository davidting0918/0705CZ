import { useState, useMemo } from 'react';
import { orders as initialOrders } from '../data/dashboardData';
import type { Order, OrderStatus } from '../types';
import { statusLabels, statusColors } from '../types';

const OrderTracking = () => {
  const [ordersData, setOrdersData] = useState<Order[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState<Order | null>(null);
  const itemsPerPage = 10;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string): string => {
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

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    setOrdersData(prev => prev.map(order => {
      if (order.id === orderId) {
        return { ...order, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return order;
    }));
    setShowStatusModal(false);
    setOrderToUpdate(null);
  };

  const openStatusModal = (order: Order) => {
    setOrderToUpdate(order);
    setShowStatusModal(true);
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | undefined => {
    const flow: Record<OrderStatus, OrderStatus> = {
      pending: 'processing',
      processing: 'shipped',
      shipped: 'delivered',
      delivered: 'delivered',
      cancelled: 'cancelled'
    };
    return flow[currentStatus];
  };

  const getStatusBadgeClass = (status: OrderStatus): string => {
    const colorMap: Record<OrderStatus, string> = {
      pending: 'bg-yellow-500/15 text-yellow-400',
      processing: 'bg-blue-500/15 text-blue-400',
      shipped: 'bg-purple-500/15 text-purple-400',
      delivered: 'bg-green-500/15 text-green-400',
      cancelled: 'bg-red-500/15 text-red-400',
    };
    return `inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${colorMap[status]}`;
  };

  return (
    <div className="max-w-container">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-100 mb-2">訂單追蹤</h1>
        <p className="text-gray-400 text-sm">追蹤與管理所有訂單狀態</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:shadow-lg transition-all">
          <div className="text-3xl font-bold text-gray-100 mb-1">{pendingCount}</div>
          <div className="text-gray-400 text-sm tracking-[0.05em] uppercase">待處理</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:shadow-lg transition-all">
          <div className="text-3xl font-bold text-gray-100 mb-1">{processingCount}</div>
          <div className="text-gray-400 text-sm tracking-[0.05em] uppercase">處理中</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:shadow-lg transition-all">
          <div className="text-3xl font-bold text-gray-100 mb-1">{shippedCount}</div>
          <div className="text-gray-400 text-sm tracking-[0.05em] uppercase">已出貨</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:shadow-lg transition-all">
          <div className="text-3xl font-bold text-gray-100 mb-1">{deliveredCount}</div>
          <div className="text-gray-400 text-sm tracking-[0.05em] uppercase">已送達</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100">訂單列表</h2>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
              placeholder="搜尋訂單編號、客戶名稱..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <select
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-blue-500"
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700/50">
                    <th className="text-left px-6 py-3.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">訂單編號</th>
                    <th className="text-left px-6 py-3.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">客戶</th>
                    <th className="text-left px-6 py-3.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">商品數</th>
                    <th className="text-left px-6 py-3.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">金額</th>
                    <th className="text-left px-6 py-3.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">狀態</th>
                    <th className="text-left px-6 py-3.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">建立時間</th>
                    <th className="text-left px-6 py-3.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map(order => (
                    <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 text-gray-100 font-semibold">{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-gray-100 font-medium">{order.customerName}</span>
                          <span className="text-xs text-gray-500">{order.customerPhone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{order.items.reduce((sum, item) => sum + item.quantity, 0)} 件</td>
                      <td className="px-6 py-4 text-green-400 font-semibold">{formatCurrency(order.total)}</td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadgeClass(order.status)}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1.5 bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                            onClick={() => setSelectedOrder(order)}
                          >
                            查看
                          </button>
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <button
                              className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors"
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
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-5 border-t border-gray-700">
                <button
                  className="px-4 py-2 border border-gray-600 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  上一頁
                </button>
                <span className="text-gray-400 text-sm mx-4">
                  第 {currentPage} / {totalPages} 頁
                </span>
                <button
                  className="px-4 py-2 border border-gray-600 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  下一頁
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <h3 className="text-lg text-gray-100 mb-2">沒有找到訂單</h3>
            <p className="text-sm">請嘗試調整篩選條件</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-gray-100">訂單詳情 - {selectedOrder.id}</h3>
              <button className="w-9 h-9 rounded-full bg-transparent text-gray-400 text-2xl flex items-center justify-center hover:bg-gray-700 hover:text-gray-100 transition-colors" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
              <div className="flex justify-center mb-6">
                <span className={getStatusBadgeClass(selectedOrder.status)} style={{ fontSize: '14px', padding: '8px 16px', boxShadow: `0 0 20px ${statusColors[selectedOrder.status]}40` }}>
                  {statusLabels[selectedOrder.status]}
                </span>
              </div>

              <div className="flex justify-between items-center py-5 mb-6 relative">
                <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-gray-700 -translate-y-1/2 z-0"></div>
                {['pending', 'processing', 'shipped', 'delivered'].map((step, index) => {
                  const stepOrder: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];
                  const currentIndex = stepOrder.indexOf(selectedOrder.status);
                  const isCompleted = index <= currentIndex && selectedOrder.status !== 'cancelled';
                  const isCurrent = step === selectedOrder.status;
                  
                  return (
                    <div key={step} className={`flex flex-col items-center gap-2 relative z-10 ${isCompleted ? '' : ''}`}>
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          isCompleted ? 'text-white' : 'bg-gray-700 text-gray-500'
                        } ${isCurrent ? 'scale-120' : ''}`} 
                        style={isCompleted ? { backgroundColor: statusColors[step as OrderStatus] } : {}}
                      >
                        {isCompleted && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${isCompleted ? 'text-gray-100' : 'text-gray-500'} ${isCurrent ? 'text-blue-400 font-semibold' : ''}`}>
                        {statusLabels[step as OrderStatus]}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-4 mb-6">
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-400 text-sm">客戶名稱</span>
                  <span className="text-gray-100 text-sm font-medium">{selectedOrder.customerName}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-400 text-sm">電話</span>
                  <span className="text-gray-100 text-sm font-medium">{selectedOrder.customerPhone}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-400 text-sm">Email</span>
                  <span className="text-gray-100 text-sm font-medium">{selectedOrder.customerEmail}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-400 text-sm">收件地址</span>
                  <span className="text-gray-100 text-sm font-medium">{selectedOrder.shippingAddress}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-400 text-sm">付款方式</span>
                  <span className="text-gray-100 text-sm font-medium">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-400 text-sm">建立時間</span>
                  <span className="text-gray-100 text-sm font-medium">{formatDate(selectedOrder.createdAt)}</span>
                </div>
                {selectedOrder.notes && (
                  <div className="grid grid-cols-[120px_1fr] gap-3">
                    <span className="text-gray-400 text-sm">備註</span>
                    <span className="text-gray-100 text-sm font-medium">{selectedOrder.notes}</span>
                  </div>
                )}
              </div>

              <h4 className="text-gray-100 font-semibold mb-3 mt-6">訂購商品</h4>
              <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-600 last:border-0">
                    <span>
                      <span className="text-gray-100">{item.productName}</span>
                      <span className="text-gray-500 ml-2">× {item.quantity}</span>
                    </span>
                    <span className="text-green-400 font-semibold">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between py-2 text-gray-400 text-sm">
                  <span>小計</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between py-2 text-gray-400 text-sm">
                  <span>運費</span>
                  <span>{selectedOrder.shipping === 0 ? '免運' : formatCurrency(selectedOrder.shipping)}</span>
                </div>
                <div className="flex justify-between pt-3 mt-2 border-t border-gray-700">
                  <span className="text-gray-100 text-lg font-bold">總計</span>
                  <span className="text-green-400 text-lg font-bold">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <button 
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    setSelectedOrder(null);
                    openStatusModal(selectedOrder);
                  }}
                >
                  更新狀態
                </button>
              )}
              <button className="px-4 py-2 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors" onClick={() => setSelectedOrder(null)}>
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && orderToUpdate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowStatusModal(false)}>
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-gray-100">更新訂單狀態</h3>
              <button className="w-9 h-9 rounded-full bg-transparent text-gray-400 text-2xl flex items-center justify-center hover:bg-gray-700 hover:text-gray-100 transition-colors" onClick={() => setShowStatusModal(false)}>×</button>
            </div>
            <div className="p-6">
              <p className="p-4 bg-gray-700/50 rounded-lg mb-5 text-gray-100">
                訂單 <strong>{orderToUpdate.id}</strong> 目前狀態：
                <span className={`ml-2 ${getStatusBadgeClass(orderToUpdate.status)}`}>
                  {statusLabels[orderToUpdate.status]}
                </span>
              </p>
              
              <div className="flex flex-col gap-2.5">
                <p className="mb-4 text-gray-400 text-sm">選擇新狀態：</p>
                {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map(status => (
                  <button
                    key={status}
                    className={`flex items-center gap-3 px-4 py-3.5 bg-gray-700/50 border-2 rounded-lg text-gray-100 text-sm font-medium transition-all ${
                      status === orderToUpdate.status 
                        ? 'border-[var(--status-color)] bg-gray-700/70 opacity-50 cursor-not-allowed' 
                        : 'border-gray-600 hover:border-[var(--status-color)] hover:bg-gray-700/70'
                    }`}
                    onClick={() => handleStatusUpdate(orderToUpdate.id, status)}
                    disabled={status === orderToUpdate.status}
                    style={{ 
                      '--status-color': statusColors[status]
                    } as React.CSSProperties}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors[status] }}></span>
                    {statusLabels[status]}
                    {status === getNextStatus(orderToUpdate.status) && (
                      <span className="ml-auto text-xs px-2 py-1 bg-green-500/15 text-green-400 rounded-lg font-semibold">建議</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
              <button className="px-4 py-2 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors" onClick={() => setShowStatusModal(false)}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
