"use client";

import { useState, useRef, useEffect } from "react";
import { X, ImageIcon, Search } from "lucide-react";
import Image from "next/image";
import type { Product } from "@/interfaces/products.interfaces";
import type { Category } from "@/interfaces/categories.interfeaces";
import type { Brand } from "@/interfaces/brands.interfaces";
import { getTokenFromCookie } from "@/lib/auth";

interface ProductModalProps {
  categories: Category[];
  brands: Brand[];
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductModal({
  categories: initialCategories,
  brands: initialBrands,
  product,
  onClose,
  onSuccess,
}: ProductModalProps) {
  const isEdit = !!product;

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [brands, setBrands] = useState<Brand[]>(initialBrands);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [stock, setStock] = useState(product?.stock ?? 0);
  const [status, setStatus] = useState(product?.status ?? "ACTIVE");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [brandId, setBrandId] = useState(product?.brandId ?? "");
  const [brandSearch, setBrandSearch] = useState(
    initialBrands.find((b) => b.id === product?.brandId)?.name ?? "",
  );
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    product?.imageUrl ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ← Fetchea categorías y marcas frescas al abrir el modal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getTokenFromCookie();
        const [catRes, brandRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories`, {
            headers: { Authorization: `Bearer ${token ?? ""}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/brands`, {
            headers: { Authorization: `Bearer ${token ?? ""}` },
          }),
        ]);
        if (catRes.ok) {
          const data = await catRes.json();
          if (Array.isArray(data)) {
            setCategories(data);
          } else if (data && Array.isArray(data.items)) {
            setCategories(data.items);
          } else {
            setCategories([]);
          }
        }
        if (brandRes.ok) {
          const data = (await brandRes.json()) as Brand[];
          setBrands(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Error fetching modal data:", e);
      }
    };
    void fetchData();
  }, []);

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase()),
  );

  const handleBrandSelect = (brand: Brand) => {
    setBrandId(brand.id);
    setBrandSearch(brand.name);
    setShowBrandDropdown(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    if (price <= 0) {
      setError("El precio debe ser mayor a 0");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = getTokenFromCookie();
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/products/${product.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/products`;

      const formData = new FormData();
      formData.append("name", name);
      if (description) formData.append("description", description);
      formData.append("price", String(price));
      formData.append("stock", String(stock));
      formData.append("status", status);
      if (categoryId) formData.append("categoryId", categoryId);
      if (brandId) formData.append("brandId", brandId);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { Authorization: `Bearer ${token ?? ""}` },
        body: formData,
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = (await res.json()) as { message: string };
        setError(data.message ?? "Error al guardar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-white">
            {isEdit ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Imagen */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Imagen del Producto
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              {imagePreview ? (
                <div className="relative w-full h-40">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain rounded-md"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <ImageIcon size={32} className="text-gray-300" />
                  <p className="text-sm text-gray-400">
                    Hacé clic para subir una imagen
                  </p>
                  <p className="text-xs text-gray-300">PNG, JPG hasta 5MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview && (
              <button
                onClick={() => {
                  setImagePreview("");
                  setImageFile(null);
                }}
                className="text-xs text-red-500 hover:text-red-700 mt-1"
              >
                Quitar imagen
              </button>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Nombre del Producto *
            </label>
            <input
              type="text"
              placeholder="Nombre del producto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Descripción
            </label>
            <textarea
              placeholder="Descripción del producto"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
            />
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Precio *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={0}
                step={0.01}
                className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Stock
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                min={0}
                className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Categoría
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="">Sin categoría</option>
              {categories
                .filter(
                  (c) =>
                    c.parentId === null ||
                    c.parentId === undefined ||
                    c.parentId === "",
                )
                .map((parent) => (
                  <optgroup key={parent.id} label={parent.name}>
                    <option value={parent.id}>{parent.name}</option>
                    {categories
                      .filter((c) => c.parentId === parent.id)
                      .map((child) => (
                        <option key={child.id} value={child.id}>
                          {"  "}
                          {child.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {categories.length === 0
                ? "Cargando categorías..."
                : `${categories.length} categorías disponibles`}
            </p>
          </div>

          {/* Marca */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Marca
            </label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar marca..."
                value={brandSearch}
                onChange={(e) => {
                  setBrandSearch(e.target.value);
                  setBrandId("");
                  setShowBrandDropdown(true);
                }}
                onFocus={() => setShowBrandDropdown(true)}
                onBlur={() =>
                  setTimeout(() => setShowBrandDropdown(false), 150)
                }
                className="w-full pl-8 pr-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            {showBrandDropdown && filteredBrands.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {filteredBrands.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleBrandSelect(b)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            )}
            {brandId && (
              <button
                onClick={() => {
                  setBrandId("");
                  setBrandSearch("");
                }}
                className="text-xs text-red-500 hover:text-red-700 mt-1"
              >
                Quitar marca
              </button>
            )}
          </div>

          {/* Estado */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Estado
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-2.5 rounded-md text-sm font-medium hover:opacity-80 disabled:opacity-50"
          >
            {loading
              ? "Guardando..."
              : isEdit
                ? "Guardar cambios"
                : "Crear producto"}
          </button>
        </div>
      </div>
    </div>
  );
}
