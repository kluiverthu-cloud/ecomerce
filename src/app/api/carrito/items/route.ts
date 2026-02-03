import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

// POST /api/carrito/items - Agregar item al carrito
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const body = await request.json();
    const { productoId, cantidad = 1 } = body;

    if (!productoId) {
      return errorResponse("El productoId es requerido", 400);
    }

    if (cantidad < 1) {
      return errorResponse("La cantidad debe ser mayor a 0", 400);
    }

    // Verificar que el producto existe y está activo
    const producto = await prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      return errorResponse("Producto no encontrado", 404);
    }

    if (!producto.activo) {
      return errorResponse("El producto no está disponible", 400);
    }

    // Verificar stock
    if (producto.stock < cantidad) {
      return errorResponse(
        `Stock insuficiente. Disponible: ${producto.stock}`,
        400
      );
    }

    // Buscar o crear carrito
    let carrito = await prisma.carrito.findUnique({
      where: { userId: auth.user.id },
    });

    if (!carrito) {
      carrito = await prisma.carrito.create({
        data: { userId: auth.user.id },
      });
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = await prisma.carritoItem.findUnique({
      where: {
        carritoId_productoId: {
          carritoId: carrito.id,
          productoId,
        },
      },
    });

    let item;

    if (existingItem) {
      // Actualizar cantidad
      const newCantidad = existingItem.cantidad + cantidad;

      if (producto.stock < newCantidad) {
        return errorResponse(
          `Stock insuficiente. Disponible: ${producto.stock}, en carrito: ${existingItem.cantidad}`,
          400
        );
      }

      item = await prisma.carritoItem.update({
        where: { id: existingItem.id },
        data: { cantidad: newCantidad },
        include: {
          producto: {
            select: {
              id: true,
              nombre: true,
              precio: true,
              precioOferta: true,
              imagenes: true,
            },
          },
        },
      });
    } else {
      // Crear nuevo item
      item = await prisma.carritoItem.create({
        data: {
          carritoId: carrito.id,
          productoId,
          cantidad,
        },
        include: {
          producto: {
            select: {
              id: true,
              nombre: true,
              precio: true,
              precioOferta: true,
              imagenes: true,
            },
          },
        },
      });
    }

    return successResponse(item, existingItem ? 200 : 201);
  } catch (error) {
    console.error("Error al agregar item al carrito:", error);
    return errorResponse("Error al agregar item al carrito", 500);
  }
}
