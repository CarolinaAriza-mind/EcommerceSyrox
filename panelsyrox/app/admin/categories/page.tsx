"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { Category } from "@/interfaces/categories.interfeaces";
import CategoriesTable from "@/components/categories/CategoriesTable";
import CategoryModal from "@/components/categories/CategoryModal";
import { getTokenFromCookie } from "@/lib/auth";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchCategories = async () => {
    try {
      const token = getTokenFromCookie();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/categories?page=1&perPage=1000`,
        { headers: { Authorization: `Bearer ${token ?? ""}` } },
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setCategories(data as Category[]);
        else if (data && Array.isArray((data as any).items))
          setCategories((data as any).items as Category[]);
        else setCategories([]);
      }
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Categorías
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Gestioná las categorías de tu tienda
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity w-full sm:w-auto"
        >
          <Plus size={16} />
          Nueva Categoría
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin" />
          <p className="text-sm text-gray-400">Cargando categorías...</p>
        </div>
      ) : (
        <CategoriesTable categories={categories} onRefresh={fetchCategories} />
      )}

      {showModal && (
        <CategoryModal
          categories={categories}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            void fetchCategories();
          }}
        />
      )}
    </div>
  );
}
