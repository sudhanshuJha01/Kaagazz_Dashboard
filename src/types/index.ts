

export interface Product {
  _id: string;
  title: string;
  originalPrice: number;
  discountPercent: number;
  category: string;
  stock?: number;
  images?: string[];
  createdAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    email: string;
  };
  totalAmount: number;
  status: string;
  createdAt: string;
  products: {
    productId: {
      _id: string;
      title: string;
      images?: string[];
    };
    quantity: number;
    price: number;
  }[];
  userId: {
    fullname: string;
    email: string;
  };
}

export interface User {
    _id: string;
    fullname: string;
    email?: string;
    createdAt: string;
    totalOrders: number;
    totalSpent: number;
}

export interface UserDetails extends User {
    phone?: string;
    role: 'user' | 'admin';
    isVerified: boolean;
    lastLoginAt: string;
    orders: Order[];
}
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  salesOverTime: { date: string; Revenue: number }[];
  revenueByCategory: { name: string; value: number; revenue: number }[];
  ordersByStatus: { name: string; value: number }[];
  recentActivity: Array<{
    type: 'order' | 'user';
    message: string;
    timestamp: Date;
    value?: number;
  }>;
  lowStockProducts: Array<{
    title: string;
    stock: number;
  }>;
  averageOrderValue: number;
}