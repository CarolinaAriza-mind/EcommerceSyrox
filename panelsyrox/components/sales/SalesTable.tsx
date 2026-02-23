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

export default function SalesTable({
  sales,
  onView,
  onManage,
}: SalesTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = sales.filter((s) => {
    const matchesSearch =
      s.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isFailedStatus = (status: string) => status === "CANCELLED";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Listado de Ventas
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="ALL">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="PREPARING">En Preparación</option>
            <option value="SHIPPED">Enviado</option>
            <option value="COMPLETED">Completado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead className="border-b border-gray-100 dark:border-gray-700">
          <tr className="text-gray-500 dark:text-gray-400 text-left">
            <th className="px-4 py-3 font-medium">Cliente</th>
            <th className="px-4 py-3 font-medium">Número de Orden</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Pago</th>
            <th className="px-4 py-3 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-400">
                No hay ventas para mostrar.
              </td>
            </tr>
          )}
          {filtered.map((sale) => (
            <tr
              key={sale.id}
              className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                    {sale.customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {sale.customer.name}
                    </p>
                    <p className="text-xs text-gray-400">{sale.customer.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="font-mono font-medium text-gray-800 dark:text-white">
                  {sale.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(sale.date).toLocaleDateString("es-AR")}
                </p>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[sale.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABELS[sale.status] ?? sale.status}
                </span>
              </td>
              <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">
                ${Number(sale.total).toLocaleString("es-AR")}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <span className={`text-xs px-2 py-1 rounded-md font-medium w-fit ${
                    isFailedStatus(sale.status)
                      ? "bg-red-600 text-white"
                      : "bg-gray-900 dark:bg-white dark:text-gray-900 text-white"
                  }`}>
                    {isFailedStatus(sale.status) ? "Fallido" : "Pagado"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {sale.paymentMethod ?? "Tarjeta"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onView(sale)}
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                    title="Ver detalles"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => onManage(sale)}
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
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
  );
}
