"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  nombre: string;
  slug: string;
  precio: number;
  precioOferta?: number | null;
  imagen: string;
  cantidad: number;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, "cantidad">, cantidad?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, cantidad: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error parsing cart from localStorage:", e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addToCart = (product: Omit<CartItem, "cantidad">, cantidad: number = 1) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);

      if (existingItem) {
        // Actualizar cantidad si ya existe
        const newCantidad = Math.min(existingItem.cantidad + cantidad, product.stock);
        return prev.map((item) =>
          item.id === product.id ? { ...item, cantidad: newCantidad } : item
        );
      }

      // Agregar nuevo item
      return [...prev, { ...product, cantidad: Math.min(cantidad, product.stock) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, cantidad: Math.min(cantidad, item.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  const total = items.reduce((sum, item) => {
    const precio = item.precioOferta ?? item.precio;
    return sum + precio * item.cantidad;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
