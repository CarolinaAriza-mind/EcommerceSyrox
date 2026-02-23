"use client";

import { useState } from "react";
import { X, User, CreditCard, MapPin, Clock } from "lucide-react";
import type { Sale } from "@/interfaces/sales.interfaces";
import {
  STATUS_STYLES,
  STATUS_LABELS,
  NEXT_STATUS,
} from "@/interfaces/sales.interfaces";
import { getTokenFromCookie } from "@/lib/auth";
import ConfirmModal from "../shared/ConfirmModal";
interface SaleModalProps {
  sale: Sale;
  onClose: () => void;
  onStatusUpdate: (updated: Sale) => void;
}

export default function SaleModal({
  sale,
  onClose,
  onStatusUpdate,
}: SaleModalProps) {
  const [notes, setNotes] = useState("");
  const [trackingCode, setTrackingCode] = useState(sale.trackingCode ?? "");
  const [loading, setLoading] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale>(sale);
  const [cancelConfirm, setCancelConfirm] = useState<{
    isOpen: boolean;
    isCancelling: boolean;
  }>({
    isOpen: false,
    isCancelling: false,
  });

  const nextStatus = NEXT_STATUS[currentSale.status];
  const isFinished =
    currentSale.status === "COMPLETED" || currentSale.status === "CANCELLED";

  const handleUpdateStatus = async () => {
    if (isFinished) return;
    setLoading(true);
    try {
      const token = getTokenFromCookie();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/sales/${sale.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token ?? ""}`,
          },
          body: JSON.stringify({
            status: nextStatus.value,
            notes,
            trackingCode: trackingCode || undefined,
            adminName: "Administrador",
          }),
        },
      );
      if (res.ok) {
        const updated = (await res.json()) as Sale;
        setCurrentSale(updated);
        onStatusUpdate(updated);
        setNotes("");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setCancelConfirm({ isOpen: true, isCancelling: false });
  };

  const handleConfirmCancel = async () => {
    setCancelConfirm((prev) => ({ ...prev, isCancelling: true }));
    try {
      const token = getTokenFromCookie();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/sales/${sale.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token ?? ""}`,
          },
          body: JSON.stringify({
            status: "CANCELLED",
            notes,
            adminName: "Administrador",
          }),
        },
      );
      if (res.ok) {
        const updated = (await res.json()) as Sale;
        setCurrentSale(updated);
        onStatusUpdate(updated);
        setCancelConfirm({ isOpen: false, isCancelling: false });
      }
    } finally {
      setCancelConfirm((prev) => ({ ...prev, isCancelling: false }));
    }
  };

  // Limpiar "null" de la dirección
  const cleanAddress = currentSale.address?.replace(/,?\s*null/gi, "").trim();

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-white">
            Gestionar Orden
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Estado actual */}
          <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">
              Estado Actual
            </p>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[currentSale.status]}`}
              >
                {STATUS_LABELS[currentSale.status]}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Orden #{currentSale.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Info cliente + pago */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <User size={14} className="text-gray-400" />
                <p className="text-xs font-medium text-gray-500">
                  Información del Cliente
                </p>
              </div>
              <p className="font-medium text-gray-800 dark:text-white text-sm">
                {currentSale.customer.name}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {currentSale.customer.email}
              </p>
              {currentSale.customer.phone && (
                <p className="text-xs text-gray-400 mt-1">
                  {currentSale.customer.phone}
                </p>
              )}
              <p className="text-xs text-gray-300 mt-1 font-mono truncate">
                ID: {currentSale.customer.id}
              </p>
            </div>

            <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={14} className="text-gray-400" />
                <p className="text-xs font-medium text-gray-500">
                  Información de Pago
                </p>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Método:</span>
                <span className="font-medium dark:text-white text-xs">
                  {currentSale.paymentMethod ?? "Tarjeta de Crédito"}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Estado:</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                    currentSale.status === "CANCELLED"
                      ? "bg-red-600 text-white"
                      : "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  }`}
                >
                  {currentSale.status === "CANCELLED" ? "Fallido" : "Pagado"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total:</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  ${Number(currentSale.total).toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          </div>

          {/* Dirección de envío */}
          {(cleanAddress ?? currentSale.trackingCode) && (
            <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} className="text-gray-400" />
                <p className="text-xs font-medium text-gray-500">
                  Información de Envío
                </p>
              </div>
              {cleanAddress && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500">Dirección de Envío:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {cleanAddress}
                  </p>
                </div>
              )}
              {currentSale.trackingCode && (
                <div>
                  <p className="text-xs text-gray-500">Tracking:</p>
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {currentSale.trackingCode}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Historial de Modificaciones */}
          <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-gray-400" />
              <p className="text-xs font-medium text-gray-500">
                Historial de Modificaciones
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  {currentSale.customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[currentSale.status]}`}
                >
                  {STATUS_LABELS[currentSale.status]}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(currentSale.date).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {currentSale.notes &&
                  currentSale.notes.split("\n").map((line, i) => (
                    <p key={i} className="text-xs text-gray-500 mt-1">
                      {line}
                    </p>
                  ))}
              </div>
            </div>
          </div>

          {/* Tracking (solo para PREPARING) */}
          {currentSale.status === "PREPARING" && (
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">
                Código de Tracking (opcional)
              </label>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Ej: 1259486214"
                className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
          )}

          {/* Notas */}
          {!isFinished && (
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
          )}

          {/* Acciones */}
          {!isFinished && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">
                Acciones Disponibles
              </p>
              <button
                onClick={handleUpdateStatus}
                disabled={loading}
                className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-2.5 rounded-md text-sm font-medium hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Actualizando..." : `✓ ${nextStatus.label}`}
              </button>
              {currentSale.status !== "CANCELLED" && (
                <button
                  onClick={handleCancelClick}
                  disabled={loading}
                  className="w-full border border-red-200 text-red-500 py-2.5 rounded-md text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                >
                  Cancelar Orden
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={cancelConfirm.isOpen}
        title="Cancelar orden"
        message="¿Estás seguro de que deseas cancelar esta orden? Los cambios se guardarán permanentemente."
        confirmLabel="Cancelar Orden"
        cancelLabel="Volver"
        isDangerous
        isLoading={cancelConfirm.isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() =>
          setCancelConfirm({ isOpen: false, isCancelling: false })
        }
      />
    </div>
  );
}
