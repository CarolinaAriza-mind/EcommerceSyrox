'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Package } from 'lucide-react';
import type { DashboardData, DashboardProduct, DashboardSale, TopProduct } from '@/interfaces/dashboard.interfaces';
import { getTokenFromCookie } from '@/lib/auth';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING:   'bg-yellow-100 text-yellow-700',
    PREPARING: 'bg-blue-100 text-blue-700',
    SHIPPED:   'bg-purple-100 text-purple-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };
  const labels: Record<string, string> = {
    PENDING:   'Pendiente',
    PREPARING: 'En Preparación',
    SHIPPED:   'Enviado',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[status] ?? status}
    </span>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = getTokenFromCookie();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`,
          {
            headers: { Authorization: `Bearer ${token ?? ''}` },
          },
        );
        if (res.ok) setData(await res.json() as DashboardData);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    void fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Inicio
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Inventario */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700 dark:text-gray-200">
              Inventario de Productos
            </h2>
            <Package size={18} className="text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {data?.inventory?.total ?? 0}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Productos en inventario · Valor: $
            {data?.inventory?.value?.toLocaleString('es-AR') ?? 0}
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data?.inventory?.products?.map((p: DashboardProduct) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300 truncate max-w-[70%]">
                  {p.name}
                </span>
                <span className="text-gray-500 shrink-0">{p.stock} uds.</span>
              </div>
            ))}
            {!data?.inventory?.products?.length && (
              <p className="text-sm text-gray-400">Sin productos en inventario.</p>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => router.push('/admin/products')}
              className="text-sm bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-3 py-1.5 rounded-md hover:opacity-80"
            >
              + Añadir
            </button>
            <button
              onClick={() => router.push('/admin/products')}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-1.5"
            >
              ··· Ver Todos
            </button>
          </div>
        </div>

        {/* Ventas Recientes */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700 dark:text-gray-200">
              Ventas Recientes
            </h2>
            <ShoppingCart size={18} className="text-gray-400" />
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {!data?.recentSales?.length && (
              <p className="text-sm text-gray-400">No hay ventas recientes.</p>
            )}
            {data?.recentSales?.map((sale: DashboardSale) => (
              <div
                key={sale.id}
                className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-1"
                onClick={() => router.push('/admin/sales')}
              >
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {sale.customer?.name}
                  </p>
                  <p className="text-xs text-gray-400 mb-1">
                    Order #{sale.id.slice(0, 8).toUpperCase()}
                  </p>
                  <StatusBadge status={sale.status} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    ${Number(sale.total).toLocaleString('es-AR')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(sale.date).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push('/admin/sales')}
            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Ver todas las ventas →
          </button>
        </div>

        {/* Top Productos */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Productos Más Vendidos
          </h2>
          {!data?.topProducts?.length ? (
            <p className="text-sm text-gray-400">
              No hay productos top para mostrar.
            </p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((tp: TopProduct, index: number) => (
                <div
                  key={tp.productId}
                  className="flex justify-between items-center text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-1 py-0.5"
                  onClick={() => router.push('/admin/products')}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 truncate max-w-[60%]">
                      {tp.product?.name}
                    </span>
                  </div>
                  <span className="text-gray-500 shrink-0">
                    {tp._sum?.quantity} vendidos
                  </span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => router.push('/admin/products')}
            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Ver todos los productos →
          </button>
        </div>

      </div>
    </div>
  );
}