"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CarritoPage() {
  const { items, removeFromCart, updateQuantity, total, itemCount, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleCheckout = () => {
    if (isAuthenticated) {
      router.push("/checkout");
    } else {
      router.push("/login?redirect=/checkout");
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={48} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Tu carrito está vacío
          </h1>
          <p className="text-gray-500 mb-6">
            Agrega productos a tu carrito para comenzar a comprar
          </p>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Productos
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">
        Carrito de Compras ({itemCount} {itemCount === 1 ? "producto" : "productos"})
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const precio = item.precioOferta ?? item.precio;
            const subtotal = precio * item.cantidad;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4"
              >
                {/* Imagen */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.imagen ? (
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={32} className="text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/productos/${item.slug}`}
                    className="font-medium text-gray-800 hover:text-blue-600 line-clamp-2"
                  >
                    {item.nombre}
                  </Link>

                  <div className="mt-1 flex items-center gap-2">
                    {item.precioOferta ? (
                      <>
                        <span className="text-lg font-bold text-blue-600">
                          Bs. {item.precioOferta.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          Bs. {item.precio.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-800">
                        Bs. {item.precio.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Controles de cantidad */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-medium">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                        disabled={item.cantidad >= item.stock}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={16} />
                      </button>
                      {item.cantidad >= item.stock && (
                        <span className="text-xs text-orange-600">Máximo</span>
                      )}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="hidden sm:block text-right">
                  <p className="text-sm text-gray-500">Subtotal</p>
                  <p className="font-bold text-gray-800">
                    Bs. {subtotal.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Vaciar carrito */}
          <button
            onClick={clearCart}
            className="text-sm text-red-600 hover:underline"
          >
            Vaciar carrito
          </button>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <h2 className="font-semibold text-gray-800 mb-4">Resumen del Pedido</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({itemCount} productos)</span>
                <span className="font-medium">Bs. {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envío</span>
                <span className="text-green-600 font-medium">Gratis</span>
              </div>
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-blue-600">
                  Bs. {total.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Proceder al Pago
              <ArrowRight size={18} />
            </button>

            <p className="mt-4 text-xs text-gray-500 text-center">
              {isAuthenticated
                ? "Serás redirigido a la página de pago"
                : "Deberás iniciar sesión para continuar"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
