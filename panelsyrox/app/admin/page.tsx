'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Package, TrendingUp } from 'lucide-react';
import type { DashboardData, DashboardProduct, DashboardSale, TopProduct } from '@/interfaces/dashboard.interfaces';
import { getTokenFromCookie } from '@/lib/auth';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING:   'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    PREPARING: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    SHIPPED:   'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    COMPLETED: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    CANCELLED: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };
  const labels: Record<string, string> = {
    PENDING:   'Pendiente',
    PREPARING: 'En Preparación',
    SHIPPED:   'Enviado',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
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
          { headers: { Authorization: `Bearer ${token ?? ''}` } },
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
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin" />
        <p className="text-sm text-gray-400">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Inicio
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Resumen general de tu tienda
        </p>
      </div>

      {/* Cards grid: 1 col mobile → 2 col tablet → 3 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">

        {/* ── Inventario ─────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="font-semibold text-gray-700 dark:text-gray-200 text-xs sm:text-sm uppercase tracking-wider">
              Inventario
            </h2>
            <div className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-800 rounded-lg shrink-0">
              <Package size={15} className="text-gray-500 dark:text-gray-400" />
            </div>
          </div>

          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {data?.inventory?.total ?? 0}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 sm:mb-4 mt-0.5 truncate">
            productos · Valor: ${data?.inventory?.value?.toLocaleString('es-AR') ?? 0}
          </p>

          {/* Product list — capped height, scrollable */}
          <div className="space-y-1.5 flex-1 max-h-48 sm:max-h-56 overflow-y-auto pr-1">
            {data?.inventory?.products?.map((p: DashboardProduct) => (
              <div
                key={p.id}
                className="flex justify-between items-center text-sm py-1 border-b border-gray-50 dark:border-gray-800 last:border-0 gap-2"
              >
                <span className="text-gray-700 dark:text-gray-300 truncate min-w-0 flex-1 text-xs sm:text-sm">
                  {p.name}
                </span>
                <span className="text-gray-400 dark:text-gray-500 shrink-0 text-xs font-mono">
                  {p.stock} uds.
                </span>
              </div>
            ))}
            {!data?.inventory?.products?.length && (
              <p className="text-sm text-gray-400">Sin productos en inventario.</p>
            )}
          </div>

          <div className="flex gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => router.push('/admin/products')}
              className="flex-1 text-xs sm:text-sm bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-2 sm:px-3 py-2 rounded-lg hover:opacity-80 transition-opacity font-medium"
            >
              + Añadir
            </button>
            <button
              onClick={() => router.push('/admin/products')}
              className="flex-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 px-2 sm:px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Ver todos
            </button>
          </div>
        </div>

        {/* ── Ventas Recientes ───────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="font-semibold text-gray-700 dark:text-gray-200 text-xs sm:text-sm uppercase tracking-wider">
              Ventas Recientes
            </h2>
            <div className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-800 rounded-lg shrink-0">
              <ShoppingCart size={15} className="text-gray-500 dark:text-gray-400" />
            </div>
          </div>

          <div className="flex-1 max-h-64 sm:max-h-72 overflow-y-auto">
            {!data?.recentSales?.length && (
              <p className="text-sm text-gray-400">No hay ventas recientes.</p>
            )}
            {data?.recentSales?.map((sale: DashboardSale) => (
              <div
                key={sale.id}
                className="flex justify-between items-start py-2.5 sm:py-3 border-b border-gray-50 dark:border-gray-800 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-lg px-2 -mx-2 transition-colors gap-2"
                onClick={() => router.push('/admin/sales')}
              >
                {/* Left side */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white truncate">
                    {sale.customer?.name}
                  </p>
                  <p className="text-xs text-gray-400 mb-1">
                    #{sale.id.slice(0, 8).toUpperCase()}
                  </p>
                  <StatusBadge status={sale.status} />
                </div>
                {/* Right side */}
                <div className="text-right shrink-0">
                  <p className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                    ${Number(sale.total).toLocaleString('es-AR')}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">
                    {new Date(sale.date).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/admin/sales')}
            className="w-full mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700 text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-600 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Ver todas las ventas →
          </button>
        </div>

        {/* ── Top Productos ──────────────────────────── */}
        {/* spans 2 cols on tablet so it fills the row, back to 1 on desktop */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5 flex flex-col sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="font-semibold text-gray-700 dark:text-gray-200 text-xs sm:text-sm uppercase tracking-wider">
              Más Vendidos
            </h2>
            <div className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-800 rounded-lg shrink-0">
              <TrendingUp size={15} className="text-gray-500 dark:text-gray-400" />
            </div>
          </div>

          {!data?.topProducts?.length ? (
            <p className="text-sm text-gray-400">No hay productos top para mostrar.</p>
          ) : (
            <div className="space-y-1 flex-1">
              {data.topProducts.map((tp: TopProduct, index: number) => (
                <div
                  key={tp.productId}
                  className="flex justify-between items-center text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-lg px-2 py-2 sm:py-2.5 -mx-2 transition-colors gap-2"
                  onClick={() => router.push('/admin/products')}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs flex items-center justify-center font-bold shrink-0 ${
                      index === 0
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                        : index === 1
                        ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        : index === 2
                        ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 truncate text-xs sm:text-sm">
                      {tp.product?.name}
                    </span>
                  </div>
                  <span className="text-gray-400 dark:text-gray-500 shrink-0 text-xs font-mono whitespace-nowrap">
                    {tp._sum?.quantity} uds.
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => router.push('/admin/products')}
            className="w-full mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700 text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-600 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Ver todos los productos →
          </button>
        </div>

      </div>
    </div>
  );
}
