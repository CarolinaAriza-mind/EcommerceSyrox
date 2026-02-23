'use client';

import { useEffect, useState } from 'react';
import { X, Search, Plus, Minus, Trash2 } from 'lucide-react';
import { getTokenFromCookie } from '@/lib/auth';
import type { Sale } from '@/interfaces/sales.interfaces';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface NewSaleModalProps {
  onClose: () => void;
  onCreated: (sale: Sale) => void;
}

export default function NewSaleModal({ onClose, onCreated }: NewSaleModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = getTokenFromCookie();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/customers`, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        });
        if (res.ok) setCustomers(await res.json() as Customer[]);
      } catch { setCustomers([]); }
    };
    void fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = getTokenFromCookie();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products`, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        });
        if (res.ok) setProducts(await res.json() as Product[]);
      } catch { setProducts([]); }
    };
    void fetchProducts();
  }, []);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase()),
  );

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
            : i,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleCreate = async () => {
    if (!selectedCustomer || cart.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const token = getTokenFromCookie();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          status: 'PENDING',
          items: cart.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
        }),
      });
      if (res.ok) {
        const created = await res.json() as Sale;
        onCreated(created);
        onClose();
      } else {
        const data = await res.json() as { message?: string };
        setError(data.message ?? 'Error al crear la venta');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-white">Nuevo Pedido</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Paso {step} de 3 — {step === 1 ? 'Seleccionar cliente' : step === 2 ? 'Agregar productos' : 'Confirmar pedido'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5">

          {/* PASO 1 */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente por nombre o email..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {filteredCustomers.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">No se encontraron clientes.</p>
                )}
                {filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCustomer?.id === c.id
                        ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800'
                        : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!selectedCustomer}
                className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-2.5 rounded-md text-sm font-medium hover:opacity-80 disabled:opacity-40"
              >
                Continuar →
              </button>
            </div>
          )}

          {/* PASO 2 */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredProducts.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No se encontraron productos.</p>
                )}
                {filteredProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{p.name}</p>
                      <p className="text-xs text-gray-400">${p.price.toLocaleString('es-AR')} · Stock: {p.stock}</p>
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      disabled={p.stock === 0}
                      className="text-xs bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-2 py-1 rounded-md hover:opacity-80 disabled:opacity-40 flex items-center gap-1"
                    >
                      <Plus size={12} /> Agregar
                    </button>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-gray-500">Carrito</p>
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between">
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[50%]">{item.product.name}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.product.id, -1)} className="text-gray-400 hover:text-gray-700">
                          <Minus size={14} />
                        </button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                        >
                          <Plus size={14} />
                        </button>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-600 ml-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">${total.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-500 py-2.5 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  ← Volver
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={cart.length === 0}
                  className="flex-1 bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-2.5 rounded-md text-sm font-medium hover:opacity-80 disabled:opacity-40"
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* PASO 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Cliente</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{selectedCustomer?.name}</p>
                  <p className="text-xs text-gray-400">{selectedCustomer?.email}</p>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                  <p className="text-xs text-gray-500 font-medium mb-2">Productos</p>
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{item.product.name} x{item.quantity}</span>
                      <span className="text-gray-500">${(item.product.price * item.quantity).toLocaleString('es-AR')}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Total</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">${total.toLocaleString('es-AR')}</span>
                </div>
              </div>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-500 py-2.5 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  ← Volver
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="flex-1 bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-2.5 rounded-md text-sm font-medium hover:opacity-80 disabled:opacity-50"
                >
                  {loading ? 'Creando...' : '✓ Confirmar Pedido'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}