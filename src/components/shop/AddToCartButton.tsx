"use client";

import { useState } from "react";
import { useCart, CartItem } from "@/context/CartContext";
import { ShoppingCart, Check, Minus, Plus } from "lucide-react";

interface AddToCartButtonProps {
  product: Omit<CartItem, "cantidad">;
  className?: string;
  showQuantitySelector?: boolean;
}

export function AddToCartButton({
  product,
  className = "",
  showQuantitySelector = true,
}: AddToCartButtonProps) {
  const { addToCart, items } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [added, setAdded] = useState(false);

  const existingItem = items.find((item) => item.id === product.id);
  const currentInCart = existingItem?.cantidad || 0;
  const maxAvailable = product.stock - currentInCart;

  const handleAddToCart = () => {
    if (cantidad > 0 && cantidad <= maxAvailable) {
      addToCart(product, cantidad);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      setCantidad(1);
    }
  };

  if (product.stock === 0) {
    return (
      <button
        disabled
        className={`bg-gray-300 text-gray-500 py-3 px-6 rounded-xl font-semibold cursor-not-allowed ${className}`}
      >
        Agotado
      </button>
    );
  }

  if (maxAvailable <= 0) {
    return (
      <button
        disabled
        className={`bg-gray-300 text-gray-500 py-3 px-6 rounded-xl font-semibold cursor-not-allowed ${className}`}
      >
        Máximo en carrito
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {showQuantitySelector && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Cantidad:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCantidad(Math.max(1, cantidad - 1))}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="w-12 text-center font-medium">{cantidad}</span>
            <button
              onClick={() => setCantidad(Math.min(maxAvailable, cantidad + 1))}
              disabled={cantidad >= maxAvailable}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
          <span className="text-xs text-gray-500">
            ({maxAvailable} disponibles)
          </span>
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={added}
        className={`flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-green-500 ${className}`}
      >
        {added ? (
          <>
            <Check size={20} />
            ¡Agregado!
          </>
        ) : (
          <>
            <ShoppingCart size={20} />
            Agregar al Carrito
          </>
        )}
      </button>

      {currentInCart > 0 && (
        <p className="text-sm text-gray-500">
          Ya tienes {currentInCart} en tu carrito
        </p>
      )}
    </div>
  );
}

// Versión compacta para cards
export function AddToCartButtonCompact({
  product,
}: {
  product: Omit<CartItem, "cantidad">;
}) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock > 0) {
      addToCart(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  if (product.stock === 0) {
    return (
      <span className="text-xs text-red-500 font-medium">Agotado</span>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      className={`p-2 rounded-lg transition-colors ${
        added
          ? "bg-green-500 text-white"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {added ? <Check size={16} /> : <ShoppingCart size={16} />}
    </button>
  );
}
