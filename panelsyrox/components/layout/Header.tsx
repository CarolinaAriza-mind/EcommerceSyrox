"use client";

import { useRouter, usePathname } from "next/navigation";
import { Bell,  LogOut } from "lucide-react";
import { removeToken } from "@/lib/auth";
import ThemeToggle from "./ThemeToggle";

const breadcrumbMap: Record<string, string> = {
  "/admin": "Inicio",
  "/admin/sales": "Ventas",
  "/admin/categories": "Categorías",
  "/admin/marcas": "Marcas",
  "/admin/products": "Productos",
  "/admin/clientes": "Clientes",
  "/admin/estadisticas": "Estadísticas",
  "/admin/descuentos": "Descuentos",
};

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export default function Header({ sidebarCollapsed }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumb = segments.map((seg, i) => {
    const path = "/" + segments.slice(0, i + 1).join("/");
    return breadcrumbMap[path] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
  });

  return (
    <header
      className="fixed top-0 right-0 z-30 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 transition-all duration-300"
      style={{ left: sidebarCollapsed ? "4rem" : "14rem" }}
    >
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {breadcrumb.join(" / ")}
      </span>

      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <Bell size={20} />
        </button>

        {/* Toggle tema */}
        <ThemeToggle />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-800 dark:bg-gray-600 text-white text-xs flex items-center justify-center font-bold">
            A
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
