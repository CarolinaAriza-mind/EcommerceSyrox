export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  status: string;
  imageUrl?: string;
  categoryId?: string;
  brandId?: string;
  category?: { id: string; name: string };
  brand?: { id: string; name: string };
  options?: ProductOption[];
  createdAt: string;
}