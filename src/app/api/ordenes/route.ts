import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, requireAdmin } from "@/lib/auth";
import {
  generateOrderNumber,
  parsePaginationParams,
  paginatedResponse,
  successResponse,
  errorResponse,
} from "@/lib/utils";

// GET /api/ordenes - Listar órdenes
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePaginationParams(searchParams);

    // Filtros
    const estado = searchParams.get("estado");

    const where: any = {};

    // Si no es admin, solo ver sus propias órdenes
    if (auth.user.role !== "ADMIN") {
      where.userId = auth.user.id;
    } else {
      // Admin puede filtrar por usuario
      const userId = searchParams.get("userId");
      if (userId) {
        where.userId = userId;
      }
    }

    if (estado) {
      where.estado = estado;
    }

    const [ordenes, total] = await Promise.all([
      prisma.orden.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, nombre: true, apellido: true, email: true },
          },
          items: {
            include: {
              producto: {
                select: { id: true, nombre: true, imagenes: true },
              },
            },
          },
        },
      }),
      prisma.orden.count({ where }),
    ]);

    return successResponse(paginatedResponse(ordenes, total, page, limit));
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return errorResponse("Error al obtener órdenes", 500);
  }
}

// POST /api/ordenes - Crear orden desde el carrito
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const body = await request.json();
    const { direccionId, metodoPago = "QR", notas } = body;

    // Obtener carrito con items
    const carrito = await prisma.carrito.findUnique({
      where: { userId: auth.user.id },
      include: {
        items: {
          include: {
            producto: true,
          },
        },
      },
    });

    if (!carrito || carrito.items.length === 0) {
      return errorResponse("El carrito está vacío", 400);
    }

    // Filtrar items activos
    const itemsActivos = carrito.items.filter((item) => item.producto.activo);

    if (itemsActivos.length === 0) {
      return errorResponse("No hay productos disponibles en el carrito", 400);
    }

    // Verificar stock de todos los productos
    for (const item of itemsActivos) {
      if (item.producto.stock < item.cantidad) {
        return errorResponse(
          `Stock insuficiente para "${item.producto.nombre}". Disponible: ${item.producto.stock}`,
          400
        );
      }
    }

    // Obtener dirección
    let direccionEnvio: any = null;

    if (direccionId) {
      const direccion = await prisma.direccion.findUnique({
        where: { id: direccionId },
      });

      if (!direccion || direccion.userId !== auth.user.id) {
        return errorResponse("Dirección no válida", 400);
      }

      direccionEnvio = {
        nombre: direccion.nombre,
        calle: direccion.calle,
        numero: direccion.numero,
        ciudad: direccion.ciudad,
        estado: direccion.estado,
        codigoPostal: direccion.codigoPostal,
        pais: direccion.pais,
        referencia: direccion.referencia,
      };
    }

    // Calcular totales
    const subtotal = itemsActivos.reduce((acc, item) => {
      const precio = item.producto.precioOferta || item.producto.precio;
      return acc + Number(precio) * item.cantidad;
    }, 0);

    const envio = 0; // Configurable según lógica de negocio
    const total = subtotal + envio;

    // Crear orden en una transacción
    const orden = await prisma.$transaction(async (tx) => {
      // Crear la orden
      const nuevaOrden = await tx.orden.create({
        data: {
          numeroOrden: generateOrderNumber(),
          userId: auth.user.id,
          subtotal,
          envio,
          total,
          metodoPago: metodoPago as any,
          direccionEnvio: direccionEnvio || {},
          notas: notas || null,
          items: {
            create: itemsActivos.map((item) => ({
              productoId: item.productoId,
              nombreProducto: item.producto.nombre,
              cantidad: item.cantidad,
              precioUnitario: item.producto.precioOferta || item.producto.precio,
              subtotal:
                Number(item.producto.precioOferta || item.producto.precio) *
                item.cantidad,
            })),
          },
        },
        include: {
          items: {
            include: {
              producto: {
                select: { id: true, nombre: true, imagenes: true },
              },
            },
          },
        },
      });

      // Actualizar stock de productos
      for (const item of itemsActivos) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: {
            stock: { decrement: item.cantidad },
          },
        });
      }

      // Vaciar carrito
      await tx.carritoItem.deleteMany({
        where: { carritoId: carrito.id },
      });

      return nuevaOrden;
    });

    return successResponse(orden, 201);
  } catch (error) {
    console.error("Error al crear orden:", error);
    return errorResponse("Error al crear orden", 500);
  }
}
