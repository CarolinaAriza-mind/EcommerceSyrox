'use client';

import { useState } from 'react';
import { X, User, CreditCard, Clock, Package } from 'lucide-react';
import { Sale, STATUS_LABELS, STATUS_OPTIONS, STATUS_STYLES } from '@/interfaces/sales.interfaces';

interface SaleModalProps {
  sale: Sale;
  onClose: () => void;
  onStatusUpdate: (updated: Sale) => void;
}

export default function SaleModal({ sale, onClose, onStatusUpdate }: SaleModalProps) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale>(sale);

  const handleUpdateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const token = document.cookie
        .split('; ')
        .find((r) => r.startsWith('admin_token='))
        ?.split('=')[1];

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/sales/${sale.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus, notes }),
        },
      );

      if (res.ok) {
        const updated = await res.json() as Sale;
        setCurrentSale(updated);
        onStatusUpdate(updated);
        setNotes('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-white">Gestionar Orden</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Estado actual */}
          <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">Estado Actual</p>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[currentSale.status]}`}>
                {STATUS_LABELS[currentSale.status] ?? currentSale.status}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Orden #{currentSale.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Cliente + Pago */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <User size={14} className="text-gray-400" />
                <p className="text-xs font-medium text-gray-500">Información del Cliente</p>
              </div>
              <p className="font-medium text-gray-800 dark:text-white text-sm">
                {currentSale.customer.name}
              </p>
              <p className="text-xs text-gray-400 mt-1">{currentSale.customer.email}</p>
              {currentSale.customer.phone && (
                <p className="text-xs text-gray-400 mt-1">{currentSale.customer.phone}</p>
              )}
            </div>

            <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={14} className="text-gray-400" />
                <p className="text-xs font-medium text-gray-500">Información de Pago</p>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Método:</span>
                <span className="font-medium dark:text-white">Tarjeta</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Estado:</span>
                <span className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white text-xs px-2 py-0.5 rounded-md">
                  Pagado
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Total:</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  ${Number(currentSale.total).toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package size={14} className="text-gray-400" />
              <p className="text-xs font-medium text-gray-500">Productos</p>
            </div>
            <div className="space-y-2">
              {currentSale.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.product?.name ?? 'Producto'} x{item.quantity}
                  </span>
                  <span className="text-gray-500">
                    ${Number(item.subtotal).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Historial */}
          <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-gray-400" />
              <p className="text-xs font-medium text-gray-500">Historial de Modificaciones</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[currentSale.status]}`}>
                {STATUS_LABELS[currentSale.status]}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(currentSale.date).toLocaleDateString('es-AR')}
              </span>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">
              Notas para el cambio de estado (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar notas sobre el cambio de estado..."
              rows={3}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
            />
          </div>

          {/* Acciones */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">Acciones Disponibles</p>
            {STATUS_OPTIONS
              .filter((s) => s.value !== currentSale.status)
              .map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleUpdateStatus(s.value)}
                  disabled={loading}
                  className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-2.5 rounded-md text-sm font-medium hover:opacity-80 disabled:opacity-50"
                >
                  {loading ? 'Actualizando...' : `Cambiar a ${s.label}`}
                </button>
              ))}
          </div>

        </div>
      </div>
    </div>
  );
}