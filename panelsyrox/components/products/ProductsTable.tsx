"use client";

import { useState } from "react";
import { Pencil, Trash2, Search, Eye } from "lucide-react";
import Image from "next/image";
import type { Product } from "@/interfaces/products.interfaces";
import type { Category } from "@/interfaces/categories.interfeaces";
import type { Brand } from "@/interfaces/brands.interfaces";
import { getTokenFromCookie } from "@/lib/auth";
import ProductModal from "./ProductModal";
import ConfirmModal from "../shared/ConfirmModal";

interface ProductsTableProps {
  products: Product[];
  brands: Brand[];
  categories: Category[];
  onRefresh: () => void;
  onView: (product: Product) => void;
}

const ITEMS_PER_PAGE = 10;

export default function ProductsTable({
  products,
  categories,
  brands,
  onRefresh,
  onView,
}: ProductsTableProps) {
  const [search, setSearch] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    productId: string | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    productId: null,
    isDeleting: false,
  });

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? p.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, productId: id, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.productId) return;
    setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }));

    try {
      const token = getTokenFromCookie();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/products/${deleteConfirm.productId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token ?? ""}` },
        },
      );
      if (res.ok || res.status === 204) {
        setDeleteConfirm({ isOpen: false, productId: null, isDeleting: false });
        onRefresh();
      } else {
        alert("Error al eliminar el producto");
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
        {/* Barra de búsqueda y filtros */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap gap-3 items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando{" "}
            {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
            –{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de{" "}
            {filtered.length} productos
          </p>
          <div className="flex gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar productos por nombre..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 w-64 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-1.5 text-sm focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
            {(search || filterStatus) && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterStatus("");
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
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Marca</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400">
                  No hay productos para mostrar.
                </td>
              </tr>
            )}
            {paginated.map((product, index) => (
              <tr
                key={product.id}
                className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0 flex items-center justify-center">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-gray-300 text-xs">Sin img</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white truncate max-w-xs">
                        {product.name}
                      </p>
                      {product.description && (
                        <p className="text-xs text-gray-400 truncate max-w-xs">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {product.category?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {product.brand?.name ?? "—"}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                  ${Number(product.price).toLocaleString("es-AR")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      product.stock === 0
                        ? "bg-red-100 text-red-700"
                        : product.stock <= 5
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {product.stock} uds.
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      product.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {product.status === "ACTIVE" ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onView(product)}
                      className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                      title="Ver detalles"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => setEditProduct(product)}
                      className="text-gray-400 hover:text-blue-600"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product.id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Eliminar"
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
              <span className="text-xs text-gray-400 shrink-0">
                {totalPages}
              </span>
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-white disabled:opacity-30 px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md"
            >
              →
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
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
                ),
              )}
            </div>
            <p className="text-xs text-gray-400 shrink-0">
              Pág. {currentPage} / {totalPages}
            </p>
          </div>
        )}
      </div>

      {editProduct && (
        <ProductModal
          categories={Array.isArray(categories) ? categories : []}
          brands={Array.isArray(brands) ? brands : []}
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSuccess={() => {
            setEditProduct(null);
            onRefresh();
          }}
        />
      )}

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Eliminar producto"
        message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        isDangerous
        isLoading={deleteConfirm.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirm({
            isOpen: false,
            productId: null,
            isDeleting: false,
          })
        }
      />
    </>
  );
}
