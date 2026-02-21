"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Modal } from "@/components/shared/Modal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/shared/Button";
import { FormField, Input, Textarea } from "@/components/shared/FormField";
import { Badge, StatusDot } from "@/components/shared/Badge";
import { ToastContainer } from "@/components/shared/Toast";
import { categoriesService, type Category } from "@/lib/api";
import { formatDateTime, truncate } from "@/lib/utils";
import { toast } from "@/hooks";
import { usePagination } from "@/hooks";

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(80),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const pagination = usePagination(filtered, 10);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true },
  });

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await categoriesService.getAll();
      setCategories(data);
      setFiltered(data);
    } catch {
      toast("error", "Error al cargar las categorías");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Filter by search
  useEffect(() => {
    const q = search.toLowerCase();
    const result = q
      ? categories.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.description?.toLowerCase().includes(q)
        )
      : categories;
    setFiltered(result);
    pagination.reset();
  }, [search, categories]);

  const openCreate = () => {
    setEditingCategory(null);
    reset({ name: "", description: "", isActive: true });
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    reset({ name: cat.name, description: cat.description, isActive: cat.isActive });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      if (editingCategory) {
        await categoriesService.update(editingCategory.id, data);
        toast("success", "Categoría actualizada correctamente");
      } else {
        await categoriesService.create(data);
        toast("success", "Categoría creada correctamente");
      }
      handleCloseModal();
      loadCategories();
    } catch {
      toast("error", "Error al guardar la categoría");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await categoriesService.remove(deleteTarget.id);
      toast("success", `Categoría "${deleteTarget.name}" eliminada`);
      setDeleteTarget(null);
      loadCategories();
    } catch {
      toast("error", "Error al eliminar la categoría");
    } finally {
      setIsDeleting(false);
    }
  };

  const isActive = watch("isActive");

  const columns: Column<Category>[] = [
    {
      key: "name",
      header: "Nombre",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Tag className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <span className="font-medium text-foreground">{row.name}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Descripción",
      render: (row) => (
        <span className="text-muted-foreground">
          {row.description ? truncate(row.description, 60) : "—"}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Estado",
      render: (row) => (
        <div className="flex items-center gap-2">
          <StatusDot active={row.isActive} />
          <Badge variant={row.isActive ? "success" : "neutral"}>
            {row.isActive ? "Activa" : "Inactiva"}
          </Badge>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Creada",
      render: (row) => (
        <span className="text-muted-foreground text-xs">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={() => openEdit(row)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Editar"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <DataTable
        columns={columns}
        data={pagination.paginated}
        isLoading={isLoading}
        emptyMessage="No hay categorías registradas"
        onSearch={setSearch}
        searchValue={search}
        searchPlaceholder="Buscar categorías..."
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        onPageChange={pagination.setPage}
        actions={
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreate}
          >
            Nueva categoría
          </Button>
        }
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? "Editar categoría" : "Nueva categoría"}
        description={
          editingCategory
            ? `Editando: ${editingCategory.name}`
            : "Completá los datos para crear una nueva categoría"
        }
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit(onSubmit)} isLoading={isSaving}>
              {editingCategory ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Nombre" error={errors.name?.message} required>
            <Input
              {...register("name")}
              placeholder="Ej: Electrónica, Ropa, Accesorios..."
              error={!!errors.name}
            />
          </FormField>

          <FormField label="Descripción" error={errors.description?.message}>
            <Textarea
              {...register("description")}
              placeholder="Descripción breve de la categoría..."
            />
          </FormField>

          <FormField label="Estado">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  {...register("isActive")}
                />
                <div
                  className={`w-10 h-5 rounded-full transition-colors ${
                    isActive ? "bg-indigo-500" : "bg-muted"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                      isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
              <span className="text-sm text-foreground">
                {isActive ? "Activa" : "Inactiva"}
              </span>
            </label>
          </FormField>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar categoría"
        description={`¿Estás seguro que querés eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer y podría afectar los productos asociados.`}
        isLoading={isDeleting}
      />

      <ToastContainer />
    </div>
  );
}
