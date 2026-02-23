"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2, X } from "lucide-react";
import type { Category } from "@/interfaces/categories.interfeaces";
import { getTokenFromCookie } from "@/lib/auth";
import CategoryModal from "./CategoryModal";
import ConfirmModal from "../shared/ConfirmModal";

interface CategoriesTableProps {
  categories: Category[];
  onRefresh: () => void;
}

export default function CategoriesTable({
  categories,
  onRefresh,
}: CategoriesTableProps) {
  const [search, setSearch] = useState("");
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [viewCategory, setViewCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    categoryId: string | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    categoryId: null,
    isDeleting: false,
  });

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, categoryId: id, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.categoryId) return;
    setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }));

    try {
      const token = getTokenFromCookie();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/categories/${deleteConfirm.categoryId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token ?? ""}` },
        },
      );

      if (res.ok || res.status === 204) {
        setDeleteConfirm({
          isOpen: false,
          categoryId: null,
          isDeleting: false,
        });
        onRefresh();
      } else {
        const data = (await res.json()) as { message: string };
        alert(data.message ?? "Error al eliminar");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
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
              <th className="px-4 py-3 font-medium">Posición</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Subcategorías</th>
              <th className="px-4 py-3 font-medium">Categoría Padre</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  No hay categorías para mostrar.
                </td>
              </tr>
            )}
            {filtered.map((cat) => (
              <tr
                key={cat.id}
                className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {cat.position}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                  {cat.name}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {cat._count?.children ?? cat.children?.length ?? 0}{" "}
                  subcategorías
                </td>
                <td className="px-4 py-3">
                  {cat.parent ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {cat.parent.name}
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      Principal
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewCategory(cat)}
                      className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => setEditCategory(cat)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(cat.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Ver Categoría */}
      {viewCategory && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-800 dark:text-white">
                Detalle de Categoría
              </h2>
              <button
                onClick={() => setViewCategory(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Nombre</p>
                <p className="font-semibold text-gray-800 dark:text-white text-lg">
                  {viewCategory.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Categoría Padre</p>
                {viewCategory.parent ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {viewCategory.parent.name}
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    Principal
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Posición</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {viewCategory.position}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">
                  Subcategorías ({viewCategory.children?.length ?? 0})
                </p>
                {viewCategory.children?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {viewCategory.children.map((child) => (
                      <span
                        key={child.id}
                        className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        {child.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Sin subcategorías</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setViewCategory(null);
                    setEditCategory(viewCategory);
                  }}
                  className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Editar
                </button>
                <button
                  onClick={() => setViewCategory(null)}
                  className="flex-1 bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-2 rounded-md text-sm hover:opacity-80"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Categoría */}
      {editCategory && (
        <CategoryModal
          categories={categories}
          category={editCategory}
          onClose={() => setEditCategory(null)}
          onSuccess={() => {
            setEditCategory(null);
            onRefresh();
          }}
        />
      )}

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Eliminar categoría"
        message="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        isDangerous
        isLoading={deleteConfirm.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirm({
            isOpen: false,
            categoryId: null,
            isDeleting: false,
          })
        }
      />
    </>
  );
}
