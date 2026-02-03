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
    <div className="flex flex-col w-64 h-screen bg-[#f0f7ff] text-slate-800 overflow-hidden relative border-r border-blue-100">
      <div className="p-8 z-10">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-1.5 rounded-lg rotate-3 group-hover:rotate-0 transition-transform shadow-md">
            <span className="text-white font-black text-xl italic leading-none">T</span>
          </div>
          <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-700 to-indigo-900 bg-clip-text text-transparent drop-shadow-sm">
            TECH<span className="text-blue-600">STORE</span>
          </span>
        </Link>
        <p className="text-[10px] uppercase font-black tracking-widest text-blue-600/80 mt-2 ml-1">ADMIN DASHBOARD</p>
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
                    ? "bg-white text-blue-700 font-bold shadow-md translate-x-1"
                    : "text-slate-500 hover:bg-white/50 hover:text-blue-600 hover:translate-x-1"
                    }`}
                >
                  <item.icon
                    size={20}
                    className={isActive ? "text-blue-600" : ""}
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
          className="flex items-center justify-center gap-2 w-full py-3 bg-blue-100/50 rounded-lg text-sm text-blue-700 font-medium hover:bg-blue-100 transition-colors"
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
