export interface DashboardProduct {
  id: string;
  name: string;
  stock: number;
  price: number;
  category?: { name: string };
}

export interface DashboardSale {
  id: string;
  status: string;
  total: number;
  date: string;
  customer: { name: string };
}

export interface TopProduct {
  productId: string;
  _sum: { quantity: number };
  product: { name: string };
}

export interface DashboardData {
  inventory: {
    total: number;
    value: number;
    products: DashboardProduct[];
  };
  recentSales: DashboardSale[];
  topProducts: TopProduct[];
}

