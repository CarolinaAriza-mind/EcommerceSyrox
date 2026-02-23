"use client";

import { X } from "lucide-react";
import Image from "next/image";
import type { Product } from "@/interfaces/products.interfaces";
import type { Category } from "@/interfaces/categories.interfeaces";

interface ProductDetailModalProps {
  product: Product;
  categories: Category[];
  onClose: () => void;
}

export default function ProductDetailModal({
  product,
  categories,
  onClose,
}: ProductDetailModalProps) {
  const subcategories = product.category
    ? categories.filter((c) => c.parentId === product.category!.id)
    : [];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-sm max-h-[80vh] overflow-y-auto shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-white text-sm">
            Detalles del Producto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3">

          {/* Imagen */}
          {product.imageUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>
          )}

          {/* Nombre y descripción */}
          <div>
            <p className="font-semibold text-gray-800 dark:text-white">
              {product.name}
            </p>
            {product.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {product.description}
              </p>
            )}
          </div>

          {/* Precio y stock */}
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Precio</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                ${Number(product.price).toLocaleString("es-AR")}
              </p>
            </div>
            <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Stock</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {product.stock} unidades
              </p>
            </div>
          </div>

          {/* Marca */}
          <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Marca</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {product.brand?.name ?? "Sin marca"}
            </p>
          </div>

          {/* Categoría y subcategorías */}
          <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-2">Categoría</p>
            {product.category ? (
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {product.category.name}
                </span>
                {subcategories.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1">Subcategorías</p>
                    <div className="flex flex-wrap gap-1">
                      {subcategories.map((sub) => (
                        <span
                          key={sub.id}
                          className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full"
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Sin categoría</p>
            )}
          </div>

          {/* Estado */}
          <div className="flex justify-between items-center px-1">
            <p className="text-xs text-gray-400">Estado</p>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              product.status === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}>
              {product.status === "ACTIVE" ? "Activo" : "Inactivo"}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}