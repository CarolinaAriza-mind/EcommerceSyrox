"use client";

import { useState } from "react";
import { Eye, Pencil } from "lucide-react";
import type { Sale } from "@/interfaces/sales.interfaces";
import { STATUS_STYLES, STATUS_LABELS } from "@/interfaces/sales.interfaces";

interface SalesTableProps {
  sales: Sale[];
  onView: (sale: Sale) => void;
  onManage: (sale: Sale) => void;
  onSaleUpdated: (updated: Sale) => void;
}

const ITEMS_PER_PAGE = 10;

const isFailedStatus = (status: string) => status === "CANCELLED";

export default function SalesTable({ sales, onView, onManage }: SalesTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = sales.filter((s) => {
    const matchesSearch =
      s.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleClear = () => {
    setSearch("");
    setStatusFilter("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">

      {/* ── Toolbar ──────────────────────────────────── */}
      <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 space-y-3">

        {/* Title + count */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 text-sm sm:text-base">
            Listado de Ventas
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap">
            {filtered.length === 0
              ? "0 ventas"
              : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filtered.length,
                )} de ${filtered.length}`}
          </p>
        </div>

        {/* Filters — stack on mobile, row on ≥sm */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre o N° de orden..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-64 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-auto border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="ALL">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="PREPARING">En Preparación</option>
            <option value="SHIPPED">Enviado</option>
            <option value="COMPLETED">Completado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
          {(search || statusFilter !== "ALL") && (
            <button
              onClick={handleClear}
              className="w-full sm:w-auto text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* ── Desktop table (hidden on mobile) ─────────── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="border-b border-gray-100 dark:border-gray-700">
            <tr className="text-gray-500 dark:text-gray-400 text-left">
              <th className="px-4 py-3 font-medium w-10">#</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">N° Orden</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Pago</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                  No hay ventas para mostrar.
                </td>
              </tr>
            )}
            {paginated.map((sale, index) => (
              <tr
                key={sale.id}
                className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="px-4 py-3 text-gray-400 text-xs tabular-nums">
                  {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0">
                      {sale.customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 dark:text-white truncate max-w-[140px]">
                        {sale.customer.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-[140px]">
                        {sale.customer.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-mono font-medium text-gray-800 dark:text-white text-xs">
                    {sale.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(sale.date).toLocaleDateString("es-AR")}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${STATUS_STYLES[sale.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABELS[sale.status] ?? sale.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white tabular-nums whitespace-nowrap">
                  ${Number(sale.total).toLocaleString("es-AR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium w-fit whitespace-nowrap ${
                      isFailedStatus(sale.status)
                        ? "bg-red-600 text-white"
                        : "bg-gray-900 dark:bg-white dark:text-gray-900 text-white"
                    }`}>
                      {isFailedStatus(sale.status) ? "Fallido" : "Pagado"}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {sale.paymentMethod ?? "Tarjeta"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onView(sale)}
                      className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors p-0.5"
                      title="Ver detalles"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onManage(sale)}
                      className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors p-0.5"
                      title="Gestionar"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile card list (hidden on ≥sm) ─────────── */}
      <div className="sm:hidden divide-y divide-gray-50 dark:divide-gray-800">
        {paginated.length === 0 && (
          <p className="text-center py-8 text-gray-400 text-sm">
            No hay ventas para mostrar.
          </p>
        )}
        {paginated.map((sale, index) => (
          <div
            key={sale.id}
            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
          >
            {/* Row 1: avatar + name + actions */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Index number */}
                <span className="text-xs text-gray-400 tabular-nums shrink-0 w-5 text-right">
                  {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0">
                  {sale.customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
                    {sale.customer.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{sale.customer.email}</p>
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => onView(sale)}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Ver detalles"
                >
                  <Eye size={15} />
                </button>
                <button
                  onClick={() => onManage(sale)}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Gestionar"
                >
                  <Pencil size={15} />
                </button>
              </div>
            </div>

            {/* Row 2: order + status + total + payment */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pl-[52px]">
              <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                #{sale.id.slice(0, 8).toUpperCase()}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(sale.date).toLocaleDateString("es-AR")}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_STYLES[sale.status] ?? "bg-gray-100 text-gray-600"}`}>
                {STATUS_LABELS[sale.status] ?? sale.status}
              </span>
              <span className="font-semibold text-gray-800 dark:text-white text-xs tabular-nums">
                ${Number(sale.total).toLocaleString("es-AR")}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-md font-medium whitespace-nowrap ${
                isFailedStatus(sale.status)
                  ? "bg-red-600 text-white"
                  : "bg-gray-900 dark:bg-white dark:text-gray-900 text-white"
              }`}>
                {isFailedStatus(sale.status) ? "Fallido" : "Pagado"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Pagination ────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="p-3 sm:p-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">

          {/* Prev / Next */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-white disabled:opacity-30 px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md"
          >
            ←
          </button>

          {/* Slider — grows to fill available space */}
          <div className="flex-1 min-w-[100px] flex items-center gap-2">
            <span className="text-xs text-gray-400 shrink-0">1</span>
            <input
              type="range"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="flex-1 accent-gray-900 dark:accent-white cursor-pointer"
            />
            <span className="text-xs text-gray-400 shrink-0">{totalPages}</span>
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-white disabled:opacity-30 px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md"
          >
            →
          </button>

          {/* Page buttons — hidden on very small screens to avoid overflow */}
          <div className="hidden xs:flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 text-xs rounded-md font-medium transition-colors ${
                  page === currentPage
                    ? "bg-gray-900 dark:bg-white dark:text-gray-900 text-white"
                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-400 whitespace-nowrap">
            Pág. {currentPage} / {totalPages}
          </p>
        </div>
      )}
    </div>
  );
}
