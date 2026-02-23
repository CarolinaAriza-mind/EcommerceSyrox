'use client';

import { useEffect, useState } from 'react';
import type { Sale } from '@/interfaces/sales.interfaces';
import SalesTable from '@/components/sales/SalesTable';
import SaleModal from '@/components/sales/SaleModal';
import NewSaleModal from '@/components/sales/NewSaleModal';
import { getTokenFromCookie } from '@/lib/auth';

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [manageSale, setManageSale] = useState<Sale | null>(null);

  const fetchSales = async () => {
    try {
      const token = getTokenFromCookie();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/sales?page=1&perPage=1000`,
        { headers: { Authorization: `Bearer ${token ?? ''}` } },
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setSales(data);
        else if (data && Array.isArray(data.items)) setSales(data.items);
        else setSales([]);
      }
    } catch {
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSales();
  }, []);

  const handleSaleUpdated = (updated: Sale) => {
    setSales((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setManageSale(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ventas</h1>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 py-2 rounded-md text-sm hover:opacity-80"
        >
          + Nuevo Pedido
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400">Cargando ventas...</p>
        </div>
      ) : (
        <SalesTable
          sales={sales}
          onView={(sale) => setManageSale(sale)}
          onManage={(sale) => setManageSale(sale)}
          onSaleUpdated={handleSaleUpdated}
        />
      )}

      {manageSale && (
        <SaleModal
          sale={manageSale}
          onClose={() => setManageSale(null)}
          onStatusUpdate={handleSaleUpdated}
        />
      )}

      {showNewModal && (
        <NewSaleModal
          onClose={() => setShowNewModal(false)}
          onCreated={(newSale) => {
            setSales((prev) => [newSale, ...prev]);
            setShowNewModal(false);
          }}
        />
      )}
    </div>
  );
}