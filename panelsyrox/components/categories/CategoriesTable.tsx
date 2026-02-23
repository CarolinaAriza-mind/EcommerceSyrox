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

const ITEMS_PER_PAGE = 10;

export default function CategoriesTable({
  categories,
  onRefresh,
}: CategoriesTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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
 console.log("categorías recibidas:", categories.length);
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
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
        setDeleteConfirm({ isOpen: false, categoryId: null, isDeleting: false });
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

        {/* Barra de búsqueda */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap gap-3 items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando{" "}
            {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
            –{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de{" "}
            {filtered.length} categorías
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-64 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 dark:border-gray-700">
            <tr className="text-gray-500 dark:text-gray-400 text-left">
              <th className="px-4 py-3 font-medium w-10">#</th>
              <th className="px-4 py-3 font-medium">Posición</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Subcategorías</th>
              <th className="px-4 py-3 font-medium">Categoría Padre</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  No hay categorías para mostrar.
                </td>
              </tr>
            )}
            {paginated.map((cat, index) => (
              <tr
                key={cat.id}
                className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {cat.position}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                  {cat.name}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {cat._count?.children ?? cat.children?.length ?? 0} subcategorías
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

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-white disabled:opacity-30 px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md"
            >
              ←
            </button>
            <div className="flex-1 flex items-center gap-3">
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
            <div className="flex gap-1">
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
            <p className="text-xs text-gray-400 shrink-0">
              Pág. {currentPage} / {totalPages}
            </p>
          </div>
        )}
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
          setDeleteConfirm({ isOpen: false, categoryId: null, isDeleting: false })
        }
      />
    </>
  );
}
