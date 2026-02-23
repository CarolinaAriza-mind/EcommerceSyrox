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
        // API may return paginated response { items, ... } or an array
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Categorías
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 py-2 rounded-md text-sm hover:opacity-80"
        >
          <Plus size={16} />
          Nueva Categoría
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400">Cargando categorías...</p>
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
