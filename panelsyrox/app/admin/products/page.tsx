"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { Product } from "@/interfaces/products.interfaces";
import type { Category } from "@/interfaces/categories.interfeaces";
import ProductsTable from "@/components/products/ProductsTable";
import ProductModal from "@/components/products/ProductModal";
import { getTokenFromCookie } from "@/lib/auth";
import { Brand } from "@/interfaces/brands.interfaces";
import ProductDetailModal from "@/components/products/ProductDetailModal";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      const token = getTokenFromCookie();

      const [prodRes, catRes, brandRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products`, {
          headers: { Authorization: `Bearer ${token ?? ""}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories`, {
          headers: { Authorization: `Bearer ${token ?? ""}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/brands`, {
          headers: { Authorization: `Bearer ${token ?? ""}` },
        }),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(Array.isArray(prodData) ? prodData : (prodData.data ?? []));
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        if (Array.isArray(catData)) {
          setCategories(catData);
        } else if (catData && Array.isArray(catData.items)) {
          setCategories(catData.items);
        } else {
          setCategories([]);
        }
      }

      if (brandRes.ok) {
        const brandData = await brandRes.json();
        setBrands(
          Array.isArray(brandData) ? brandData : (brandData.data ?? []),
        );
      }
    } catch {
      setProducts([]);
      setCategories([]);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
          Productos
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 py-2 rounded-md text-sm hover:opacity-80 w-full sm:w-auto"
        >
          <Plus size={16} />
          Nuevo Producto
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400 text-sm sm:text-base">Cargando productos...</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg">
          <ProductsTable
            products={products}
            categories={categories}
            brands={brands}
            onRefresh={fetchProducts}
            onView={(p) => setViewProduct(p)}
          />
        </div>
      )}

      {/* Modal nuevo producto */}
      {showModal && (
        <ProductModal
          categories={categories}
          brands={brands}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            void fetchProducts();
          }}
        />
      )}

      {/* Modal detalle producto */}
      {viewProduct && (
        <ProductDetailModal
          product={viewProduct}
          categories={categories}
          onClose={() => setViewProduct(null)}
        />
      )}
    </div>
  );
}
