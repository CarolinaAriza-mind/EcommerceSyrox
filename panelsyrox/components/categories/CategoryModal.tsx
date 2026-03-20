'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Category } from '@/interfaces/categories.interfeaces';
import { getTokenFromCookie } from '@/lib/auth';

interface CategoryModalProps {
  categories: Category[];
  category?: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CategoryModal({
  categories,
  category,
  onClose,
  onSuccess,
}: CategoryModalProps) {
  const isEdit = !!category;
  const [name, setName] = useState(category?.name ?? '');
  const [parentId, setParentId] = useState(category?.parentId ?? '');
  const [position, setPosition] = useState(category?.position ?? 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = getTokenFromCookie();
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/categories/${category.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/categories`;

      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({
          name,
          position,
          parentId: parentId || undefined,
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json() as { message: string };
        setError(data.message ?? 'Error al guardar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Filtrá la categoría actual para no poder ser su propio padre
  const parentOptions = categories.filter((c) => c.id !== category?.id);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-xl w-full sm:max-w-md shadow-2xl">

        {/* Drag handle en mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-white">
              {isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit ? `Modificando: ${category.name}` : 'Completá los campos para crear una categoría'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Nombre */}
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5 uppercase tracking-wider">
              Nombre <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Smartphones, Laptops..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-shadow placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>

          {/* Categoría Padre */}
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5 uppercase tracking-wider">
              Categoría Padre
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-shadow"
            >
              <option value="">Principal (sin padre)</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Posición */}
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5 uppercase tracking-wider">
              Posición
            </label>
            <input
              type="number"
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
              min={1}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-shadow"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2.5">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-80 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
