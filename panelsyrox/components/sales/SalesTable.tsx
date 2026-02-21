"use client";

import { useState } from "react";
import { Eye, Pencil } from "lucide-react";
import SaleModal from "./SaleModal";
import { Sale, STATUS_LABELS, STATUS_STYLES } from "@/interfaces/sales.interfaces";


export default function SalesTable({ sales }: { sales: Sale[] }) {
  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filtered = sales.filter(
    (s) =>
      s.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Listado de Ventas
          </h2>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
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
                      <p className="text-xs text-gray-400">
                        {sale.customer.email}
                      </p>
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
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[sale.status] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {STATUS_LABELS[sale.status] ?? sale.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">
                  ${Number(sale.total).toLocaleString("es-AR")}
                </td>
                <td className="px-4 py-3">
                  <span className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white text-xs px-2 py-1 rounded-md">
                    Pagado
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
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

      {selectedSale && (
        <SaleModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
          onStatusUpdate={(updatedSale) => setSelectedSale(updatedSale)}
        />
      )}
    </>
  );
}
