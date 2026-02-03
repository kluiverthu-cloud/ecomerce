import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/carrito/items/[id] - Actualizar cantidad de item
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const { id } = await params;
    const body = await request.json();
    const { cantidad } = body;

    if (cantidad === undefined || cantidad < 1) {
      return errorResponse("La cantidad debe ser mayor a 0", 400);
    }

    // Buscar el item
    const item = await prisma.carritoItem.findUnique({
      where: { id },
      include: {
        carrito: true,
        producto: true,
      },
    });

    if (!item) {
      return errorResponse("Item no encontrado", 404);
    }

    // Verificar que el item pertenece al usuario
    if (item.carrito.userId !== auth.user.id) {
      return errorResponse("No tienes permiso para modificar este item", 403);
    }

    // Verificar stock
    if (item.producto.stock < cantidad) {
      return errorResponse(
        `Stock insuficiente. Disponible: ${item.producto.stock}`,
        400
      );
    }

    const updatedItem = await prisma.carritoItem.update({
      where: { id },
      data: { cantidad },
      include: {
        producto: {
          select: {
            id: true,
            nombre: true,
            precio: true,
            precioOferta: true,
            imagenes: true,
            stock: true,
          },
        },
      },
    });

    return successResponse(updatedItem);
  } catch (error) {
    console.error("Error al actualizar item:", error);
    return errorResponse("Error al actualizar item", 500);
  }
}

// DELETE /api/carrito/items/[id] - Eliminar item del carrito
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const { id } = await params;

    // Buscar el item
    const item = await prisma.carritoItem.findUnique({
      where: { id },
      include: {
        carrito: true,
      },
    });

    if (!item) {
      return errorResponse("Item no encontrado", 404);
    }

    // Verificar que el item pertenece al usuario
    if (item.carrito.userId !== auth.user.id) {
      return errorResponse("No tienes permiso para eliminar este item", 403);
    }

    await prisma.carritoItem.delete({
      where: { id },
    });

    return successResponse({ message: "Item eliminado del carrito" });
  } catch (error) {
    console.error("Error al eliminar item:", error);
    return errorResponse("Error al eliminar item", 500);
  }
}
