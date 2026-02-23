"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md shadow-xl">
        {/* Header con icono */}
        <div
          className={`pt-6 px-6 pb-4 flex items-center gap-3 ${isDangerous ? "border-b border-red-100 dark:border-red-900" : "border-b border-gray-100 dark:border-gray-700"}`}
        >
          {isDangerous && (
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          )}
          <h2
            className={`text-lg font-semibold ${isDangerous ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-white"}`}
          >
            {title}
          </h2>
          <button
            onClick={onCancel}
            className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="px-6 py-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm">{message}</p>
        </div>

        {/* Botones */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 transition-colors ${
              isDangerous
                ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                : "bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:opacity-80"
            }`}
          >
            {isLoading ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
