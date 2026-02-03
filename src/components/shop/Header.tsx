"use client";

import Link from "next/link";
import { ShoppingCart, User, Menu, X, LogOut, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export function Header() {
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          TECH STORE
        </Link>

        <nav className="hidden md:flex gap-6">
          <Link
            href="/productos"
            className="text-gray-600 hover:text-black transition-colors"
          >
            Productos
          </Link>
          <Link
            href="/categorias"
            className="text-gray-600 hover:text-black transition-colors"
          >
            Categorías
          </Link>
          <Link
            href="/ofertas"
            className="text-gray-600 hover:text-black transition-colors"
          >
            Ofertas
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Carrito */}
          <Link
            href="/carrito"
            className="p-2 hover:bg-gray-100 rounded-full relative"
          >
            <ShoppingCart size={24} className="text-gray-700" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          {/* Usuario */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.nombre?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.nombre}
                </span>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-20">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.nombre} {user?.apellido}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      href="/mis-pedidos"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Package size={16} />
                      Mis Pedidos
                    </Link>
                    {user?.role === "ADMIN" && (
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={16} />
                        Panel Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                    >
                      <LogOut size={16} />
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <User size={18} />
              <span className="hidden md:block">Iniciar Sesión</span>
            </Link>
          )}

          {/* Menu móvil */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menu móvil expandido */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-4">
          <Link
            href="/productos"
            className="block text-gray-600 hover:text-black"
            onClick={() => setMobileMenuOpen(false)}
          >
            Productos
          </Link>
          <Link
            href="/categorias"
            className="block text-gray-600 hover:text-black"
            onClick={() => setMobileMenuOpen(false)}
          >
            Categorías
          </Link>
          <Link
            href="/ofertas"
            className="block text-gray-600 hover:text-black"
            onClick={() => setMobileMenuOpen(false)}
          >
            Ofertas
          </Link>
        </div>
      )}
    </header>
  );
}
