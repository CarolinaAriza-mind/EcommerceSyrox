"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Tag, Package, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Inicio", href: "/admin", icon: Home },
  { label: "Ventas", href: "/admin/sales", icon: ShoppingCart },
  { label: "Categorías", href: "/admin/categories", icon: Tag },
  { label: "Productos", href: "/admin/products", icon: Package },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 fixed left-0 top-0 z-40",
        collapsed ? "w-16" : "w-56",
      )}
    >
      {/* Logo + toggle */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-700">
        {!collapsed && (
          <span className="font-bold text-base text-gray-800 dark:text-white">
            Tech House
          </span>
        )}
        <button
          onClick={onToggle}
          className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <ChevronLeft
            size={18}
            className={cn(
              "transition-transform duration-300",
              collapsed && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white",
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
