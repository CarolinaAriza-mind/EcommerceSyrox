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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Productos
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 py-2 rounded-md text-sm hover:opacity-80"
        >
          <Plus size={16} />
          Nuevo Producto
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400">Cargando productos...</p>
        </div>
      ) : (
        <ProductsTable
          products={products}
          categories={categories}
          brands={brands}
          onRefresh={fetchProducts}
          onView={(p) => setViewProduct(p)}
        />
      )}

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
