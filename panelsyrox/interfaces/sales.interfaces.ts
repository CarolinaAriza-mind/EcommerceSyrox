export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: { name: string; price: number; imageUrl?: string };
}

export interface Sale {
  id: string;
  status: string;
  total: number;
  date: string;
  paymentMethod?: string;
  trackingCode?: string;
  address?: string;
  notes?: string;
  customer: Customer;
  items: SaleItem[];
}

export const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  PREPARING: 'bg-blue-100 text-blue-700',
  SHIPPED:   'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING:   'Pendiente',
  PREPARING: 'En Preparación',
  SHIPPED:   'Enviado',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

export const STATUS_OPTIONS = [
  { value: 'PENDING',   label: 'Pendiente' },
  { value: 'PREPARING', label: 'En Preparación' },
  { value: 'SHIPPED',   label: 'Enviado' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export const NEXT_STATUS: Record<string, { value: string; label: string }> = {
  PENDING:   { value: 'PREPARING', label: 'Iniciar Preparación' },
  PREPARING: { value: 'SHIPPED',   label: 'Marcar como Enviado' },
  SHIPPED:   { value: 'COMPLETED', label: 'Completar Pedido' },
  COMPLETED: { value: 'COMPLETED', label: 'Pedido Completado' },
  CANCELLED: { value: 'CANCELLED', label: 'Pedido Cancelado' },
};