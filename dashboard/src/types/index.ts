// Product type definition
export interface Product {
  id: number;
  name: string;
  price: number;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  category: string;
}

// Stock status type
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

// Stock change type
export type StockChangeType = 'increase' | 'decrease' | 'adjustment' | 'return' | 'damage';

// Stock history entry
export interface StockHistory {
  id: string;
  productId: number;
  productName: string;
  productSku: string;
  type: StockChangeType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  operator: string;
  createdAt: string;
  notes?: string;
}

// Order status type
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Order item
export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

// Order interface
export interface Order {
  id: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// Customer interface (for reference, may not be used in simplified version)
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  status: 'new' | 'active' | 'vip';
}

// Dashboard statistics
export interface DashboardStats {
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  totalOrders: number;
  completedOrders: number;
  activeCustomers: number;
  totalCustomers: number;
  vipCustomers: number;
}

// Status labels and colors
export const statusLabels: Record<OrderStatus, string> = {
  pending: '待處理',
  processing: '處理中',
  shipped: '已出貨',
  delivered: '已送達',
  cancelled: '已取消',
};

export const statusColors: Record<OrderStatus, string> = {
  pending: '#ffad1f',
  processing: '#1d9bf0',
  shipped: '#7856ff',
  delivered: '#00ba7c',
  cancelled: '#f4212e',
};

export const stockStatusLabels: Record<StockStatus, string> = {
  in_stock: '庫存充足',
  low_stock: '庫存不足',
  out_of_stock: '已售完',
};

export const stockStatusColors: Record<StockStatus, string> = {
  in_stock: '#00ba7c',
  low_stock: '#ffad1f',
  out_of_stock: '#f4212e',
};

export const stockChangeTypes: Record<StockChangeType, string> = {
  increase: '進貨',
  decrease: '出貨',
  adjustment: '調整',
  return: '退貨',
  damage: '損耗',
};

// Admin/Staff interface
export interface Admin {
  id: number;
  name: string;
  role: string;
  photo?: string;
}
