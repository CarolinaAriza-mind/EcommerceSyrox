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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-white">
            {isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Nombre */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Nombre
            </label>
            <input
              type="text"
              placeholder="Nombre de la categoría"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* Categoría Padre */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Categoría Padre
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Posición
            </label>
            <input
              type="number"
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
              min={1}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Botón */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-2.5 rounded-md text-sm font-medium hover:opacity-80 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear'}
          </button>

        </div>
      </div>
    </div>
  );
}