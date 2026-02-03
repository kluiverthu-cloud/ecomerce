"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Users,
  QrCode,
  Package,
  FolderTree,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Productos", icon: ShoppingBag, href: "/products" },
  { name: "Órdenes", icon: Package, href: "/ordenes" },
  { name: "Pagos QR", icon: QrCode, href: "/pagos" },
  { name: "Usuarios", icon: Users, href: "/usuarios" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 h-screen bg-[#1e0a3c] text-white overflow-hidden relative">
      <div className="p-8 z-10">
        <h1 className="text-2xl font-bold tracking-wide">TECH STORE</h1>
        <p className="text-xs text-gray-400 mt-1">Panel de Administración</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 z-10 custom-scrollbar">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                      ? "bg-white text-[#1e0a3c] font-semibold shadow-lg translate-x-1"
                      : "text-gray-300 hover:bg-white/10 hover:text-white hover:translate-x-1"
                    }`}
                >
                  <item.icon
                    size={20}
                    className={isActive ? "text-[#1e0a3c]" : ""}
                  />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Link a la tienda */}
      <div className="p-4 z-10">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/20 transition-colors"
        >
          🛒 Ver Tienda
        </Link>
      </div>

      {/* Decorative background circle effect */}
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-600/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
    </div>
  );
}
