import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

// GET /api/carrito - Obtener carrito del usuario
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    // Buscar o crear carrito
    let carrito = await prisma.carrito.findUnique({
      where: { userId: auth.user.id },
      include: {
        items: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                slug: true,
                precio: true,
                precioOferta: true,
                stock: true,
                imagenes: true,
                activo: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!carrito) {
      carrito = await prisma.carrito.create({
        data: { userId: auth.user.id },
        include: {
          items: {
            include: {
              producto: {
                select: {
                  id: true,
                  nombre: true,
                  slug: true,
                  precio: true,
                  precioOferta: true,
                  stock: true,
                  imagenes: true,
                  activo: true,
                },
              },
            },
          },
        },
      });
    }

    // Calcular totales
    const itemsActivos = carrito.items.filter((item) => item.producto.activo);
    const subtotal = itemsActivos.reduce((acc, item) => {
      const precio = item.producto.precioOferta || item.producto.precio;
      return acc + Number(precio) * item.cantidad;
    }, 0);

    const totalItems = itemsActivos.reduce((acc, item) => acc + item.cantidad, 0);

    return successResponse({
      ...carrito,
      items: itemsActivos,
      subtotal,
      totalItems,
    });
  } catch (error) {
    console.error("Error al obtener carrito:", error);
    return errorResponse("Error al obtener carrito", 500);
  }
}

// DELETE /api/carrito - Vaciar carrito
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const carrito = await prisma.carrito.findUnique({
      where: { userId: auth.user.id },
    });

    if (!carrito) {
      return errorResponse("Carrito no encontrado", 404);
    }

    await prisma.carritoItem.deleteMany({
      where: { carritoId: carrito.id },
    });

    return successResponse({ message: "Carrito vaciado correctamente" });
  } catch (error) {
    console.error("Error al vaciar carrito:", error);
    return errorResponse("Error al vaciar carrito", 500);
  }
}
