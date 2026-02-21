'use client';

import { useEffect, useState } from 'react';
import { Sale } from '@/interfaces/sales.interfaces';
import SalesTable from '@/components/sales/SalesTable';
import { getToken } from '@/lib/auth';

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const token = getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/sales`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          const data = await res.json() as Sale[];
          setSales(data);
        }
      } catch {
        setSales([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchSales();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ventas</h1>
        <button className="flex items-center gap-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 py-2 rounded-md text-sm hover:opacity-80">
          + Nuevo Pedido
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400">Cargando ventas...</p>
        </div>
      ) : (
        <SalesTable sales={sales} />
      )}
    </div>
  );
}