import type { Product, Order, OrderItem, StockHistory, StockStatus, StockChangeType, Customer, DashboardStats, OrderStatus, Admin } from '../types';
import { stockChangeTypes } from '../types';

// Products data (synced from frontend demoData.js)
export const products: Product[] = [
  {
    id: 1,
    name: '香辣辣椒醬',
    price: 180.00,
    sku: 'SAU-001',
    stock: 150,
    lowStockThreshold: 30,
    category: '辣醬系列'
  },
  {
    id: 2,
    name: '海鮮沾醬',
    price: 220.00,
    sku: 'SAU-002',
    stock: 25,
    lowStockThreshold: 30,
    category: '海鮮醬料'
  },
  {
    id: 3,
    name: '沙茶醬',
    price: 160.00,
    sku: 'SAU-003',
    stock: 200,
    lowStockThreshold: 40,
    category: '經典醬料'
  },
  {
    id: 4,
    name: '泰式甜辣醬',
    price: 150.00,
    sku: 'SAU-004',
    stock: 0,
    lowStockThreshold: 25,
    category: '異國風味'
  },
  {
    id: 5,
    name: '蒜蓉醬',
    price: 140.00,
    sku: 'SAU-005',
    stock: 180,
    lowStockThreshold: 35,
    category: '經典醬料'
  },
  {
    id: 6,
    name: '黑胡椒醬',
    price: 190.00,
    sku: 'SAU-006',
    stock: 15,
    lowStockThreshold: 20,
    category: '西式醬料'
  }
];

// Generate stock history
const generateStockHistory = (): StockHistory[] => {
  const history: StockHistory[] = [];
  const operators = ['管理員', '店長', '倉管人員'];
  const reasons: Record<StockChangeType, string[]> = {
    increase: ['供應商進貨', '補貨', '調撥入庫'],
    decrease: ['訂單出貨', '調撥出庫', '促銷活動'],
    adjustment: ['盤點調整', '系統校正', '數量修正'],
    return: ['客戶退貨', '瑕疵品退回'],
    damage: ['商品過期', '包裝破損', '運送損壞']
  };

  const getRandomDate = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    date.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));
    return date.toISOString();
  };

  for (let i = 1; i <= 40; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const typeWeights: Record<StockChangeType, number> = { increase: 35, decrease: 30, adjustment: 20, return: 10, damage: 5 };
    
    let type: StockChangeType = 'increase';
    const total = Object.values(typeWeights).reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    for (const [t, weight] of Object.entries(typeWeights)) {
      random -= weight;
      if (random <= 0) {
        type = t as StockChangeType;
        break;
      }
    }

    const quantity = type === 'increase' 
      ? Math.floor(Math.random() * 50) + 20
      : Math.floor(Math.random() * 15) + 1;

    const reasonOptions = reasons[type];
    const reason = reasonOptions[Math.floor(Math.random() * reasonOptions.length)];

    history.push({
      id: `STK-${String(i).padStart(5, '0')}`,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      type,
      quantity,
      previousStock: product.stock + (type === 'increase' ? -quantity : quantity),
      newStock: product.stock,
      reason,
      operator: operators[Math.floor(Math.random() * operators.length)],
      createdAt: getRandomDate(60),
      notes: Math.random() > 0.7 ? '備註說明' : ''
    });
  }

  return history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const stockHistory: StockHistory[] = generateStockHistory();

// Stock status helpers
export const getStockStatus = (stock: number, threshold: number): StockStatus => {
  if (stock === 0) return 'out_of_stock';
  if (stock <= threshold) return 'low_stock';
  return 'in_stock';
};

// Customer data
export const customers: Customer[] = [
  { id: 1, name: '王小明', email: 'wang.xiaoming@email.com', phone: '0912-345-678', address: '台北市信義區信義路五段7號', totalOrders: 12, totalSpent: 5680, joinDate: '2024-03-15', status: 'active' },
  { id: 2, name: '李美玲', email: 'li.meiling@email.com', phone: '0923-456-789', address: '新北市板橋區文化路一段100號', totalOrders: 8, totalSpent: 3240, joinDate: '2024-04-22', status: 'active' },
  { id: 3, name: '張志豪', email: 'zhang.zhihao@email.com', phone: '0934-567-890', address: '台中市西屯區台灣大道三段99號', totalOrders: 15, totalSpent: 7890, joinDate: '2024-02-10', status: 'vip' },
  { id: 4, name: '陳雅婷', email: 'chen.yating@email.com', phone: '0945-678-901', address: '高雄市前鎮區中山二路2號', totalOrders: 5, totalSpent: 1850, joinDate: '2024-06-05', status: 'active' },
  { id: 5, name: '林建宏', email: 'lin.jianhong@email.com', phone: '0956-789-012', address: '台南市中西區中正路1號', totalOrders: 20, totalSpent: 12500, joinDate: '2024-01-08', status: 'vip' },
  { id: 6, name: '黃淑芬', email: 'huang.shufen@email.com', phone: '0967-890-123', address: '桃園市中壢區中央西路二段88號', totalOrders: 3, totalSpent: 920, joinDate: '2024-08-20', status: 'active' },
  { id: 7, name: '吳俊傑', email: 'wu.junjie@email.com', phone: '0978-901-234', address: '新竹市東區光復路二段101號', totalOrders: 9, totalSpent: 4120, joinDate: '2024-05-12', status: 'active' },
  { id: 8, name: '許雅琪', email: 'xu.yaqi@email.com', phone: '0989-012-345', address: '彰化縣彰化市中山路二段500號', totalOrders: 6, totalSpent: 2680, joinDate: '2024-07-03', status: 'active' },
  { id: 9, name: '蔡明哲', email: 'cai.mingzhe@email.com', phone: '0910-123-456', address: '嘉義市東區中山路169號', totalOrders: 25, totalSpent: 15200, joinDate: '2023-11-25', status: 'vip' },
  { id: 10, name: '鄭家豪', email: 'zheng.jiahao@email.com', phone: '0921-234-567', address: '宜蘭縣宜蘭市中山路三段1號', totalOrders: 4, totalSpent: 1560, joinDate: '2024-09-01', status: 'active' },
  { id: 11, name: '謝佳穎', email: 'xie.jiaying@email.com', phone: '0932-345-678', address: '花蓮縣花蓮市中山路503號', totalOrders: 7, totalSpent: 3150, joinDate: '2024-06-18', status: 'active' },
  { id: 12, name: '曾威翔', email: 'zeng.weixiang@email.com', phone: '0943-456-789', address: '屏東縣屏東市自由路36號', totalOrders: 11, totalSpent: 5420, joinDate: '2024-04-08', status: 'active' },
  { id: 13, name: '廖怡君', email: 'liao.yijun@email.com', phone: '0954-567-890', address: '南投縣南投市中興路100號', totalOrders: 2, totalSpent: 680, joinDate: '2024-10-15', status: 'new' },
  { id: 14, name: '賴志明', email: 'lai.zhiming@email.com', phone: '0965-678-901', address: '雲林縣斗六市大學路三段123號', totalOrders: 18, totalSpent: 9800, joinDate: '2024-02-28', status: 'vip' },
  { id: 15, name: '周雅慧', email: 'zhou.yahui@email.com', phone: '0976-789-012', address: '苗栗縣苗栗市中正路1291號', totalOrders: 1, totalSpent: 340, joinDate: '2024-11-02', status: 'new' },
  { id: 16, name: '楊承恩', email: 'yang.chengen@email.com', phone: '0987-890-123', address: '基隆市仁愛區愛一路1號', totalOrders: 14, totalSpent: 6890, joinDate: '2024-03-20', status: 'active' },
  { id: 17, name: '徐淑華', email: 'xu.shuhua@email.com', phone: '0918-901-234', address: '澎湖縣馬公市中正路1號', totalOrders: 6, totalSpent: 2540, joinDate: '2024-07-25', status: 'active' },
  { id: 18, name: '蕭宗翰', email: 'xiao.zonghan@email.com', phone: '0929-012-345', address: '金門縣金城鎮民生路60號', totalOrders: 3, totalSpent: 1120, joinDate: '2024-08-10', status: 'active' },
  { id: 19, name: '潘美琪', email: 'pan.meiqi@email.com', phone: '0940-123-456', address: '連江縣南竿鄉介壽村76號', totalOrders: 8, totalSpent: 3680, joinDate: '2024-05-30', status: 'active' },
  { id: 20, name: '洪偉誠', email: 'hong.weicheng@email.com', phone: '0951-234-567', address: '台東縣台東市中山路276號', totalOrders: 22, totalSpent: 11200, joinDate: '2023-12-15', status: 'vip' }
];

// Generate orders with realistic data
const generateOrders = (): Order[] => {
  const orders: Order[] = [];
  const statusWeights: Record<OrderStatus, number> = { pending: 15, processing: 20, shipped: 25, delivered: 35, cancelled: 5 };
  
  const getRandomStatus = (): OrderStatus => {
    const total = Object.values(statusWeights).reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    for (const [status, weight] of Object.entries(statusWeights)) {
      random -= weight;
      if (random <= 0) return status as OrderStatus;
    }
    return 'delivered';
  };

  const getRandomDate = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    return date.toISOString();
  };

  for (let i = 1; i <= 55; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const numItems = Math.floor(Math.random() * 4) + 1;
    const orderItems: OrderItem[] = [];
    const usedProducts = new Set<number>();

    for (let j = 0; j < numItems; j++) {
      let product: Product;
      do {
        product = products[Math.floor(Math.random() * products.length)];
      } while (usedProducts.has(product.id) && usedProducts.size < products.length);
      
      usedProducts.add(product.id);
      const quantity = Math.floor(Math.random() * 3) + 1;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
        subtotal: product.price * quantity
      });
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const shipping = subtotal >= 1000 ? 0 : 60;
    const status = getRandomStatus();
    const createdAt = getRandomDate(90);

    orders.push({
      id: `ORD-${String(i).padStart(5, '0')}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      shippingAddress: customer.address,
      items: orderItems,
      subtotal,
      shipping,
      total: subtotal + shipping,
      status,
      paymentMethod: Math.random() > 0.3 ? '信用卡' : '貨到付款',
      createdAt,
      updatedAt: createdAt,
      notes: Math.random() > 0.8 ? '請小心包裝' : ''
    });
  }

  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const orders: Order[] = generateOrders();

// Generate sales records from delivered orders
export const salesRecords = orders
  .filter(order => order.status === 'delivered')
  .map(order => ({
    id: `SALE-${order.id.replace('ORD-', '')}`,
    orderId: order.id,
    customerId: order.customerId,
    customerName: order.customerName,
    items: order.items,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    paymentMethod: order.paymentMethod,
    completedAt: order.createdAt
  }));

// Dashboard statistics
export const getDashboardStats = (): DashboardStats => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  });

  const totalRevenue = salesRecords.reduce((sum, sale) => sum + sale.total, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const processingOrders = orders.filter(order => order.status === 'processing').length;
  const activeCustomers = customers.filter(c => c.status === 'active' || c.status === 'vip').length;

  return {
    totalRevenue,
    todayOrders: todayOrders.length,
    todayRevenue: todayOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0),
    pendingOrders,
    processingOrders,
    totalOrders: orders.length,
    completedOrders: salesRecords.length,
    activeCustomers,
    totalCustomers: customers.length,
    vipCustomers: customers.filter(c => c.status === 'vip').length
  };
};

// Current logged-in admin/staff data
export const currentAdmin: Admin = {
  id: 1,
  name: '管理員',
  role: 'Store Manager',
  photo: undefined // Will use placeholder avatar
};
