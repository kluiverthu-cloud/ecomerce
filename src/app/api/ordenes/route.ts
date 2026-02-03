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

// POST /api/ordenes - Crear orden (desde carrito del cliente)
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const body = await request.json();
    const { items, datosEnvio, comprobantePago, metodoPago = "QR", subtotal, total } = body;

    // Validar que hay items
    if (!items || items.length === 0) {
      return errorResponse("El carrito está vacío", 400);
    }

    // Validar datos de envío
    if (!datosEnvio || !datosEnvio.direccion || !datosEnvio.ciudad) {
      return errorResponse("Datos de envío incompletos", 400);
    }

    // Validar comprobante
    if (!comprobantePago) {
      return errorResponse("Comprobante de pago requerido", 400);
    }

    // Verificar stock de todos los productos
    for (const item of items) {
      const producto = await prisma.producto.findUnique({
        where: { id: item.productoId },
        select: { stock: true, nombre: true, activo: true },
      });

      if (!producto || !producto.activo) {
        return errorResponse(
          `Producto no disponible: ${item.nombreProducto}`,
          400
        );
      }

      if (producto.stock < item.cantidad) {
        return errorResponse(
          `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}`,
          400
        );
      }
    }

    // Construir dirección de envío
    const direccionEnvio = `${datosEnvio.direccion}, ${datosEnvio.ciudad}${
      datosEnvio.referencia ? ` (Ref: ${datosEnvio.referencia})` : ""
    }`;

    // Crear orden en una transacción
    const orden = await prisma.$transaction(async (tx) => {
      // Crear la orden
      const nuevaOrden = await tx.orden.create({
        data: {
          numeroOrden: generateOrderNumber(),
          userId: auth.user.id,
          estado: "VERIFICANDO", // Pendiente de verificación del comprobante
          subtotal,
          envio: 0,
          total,
          metodoPago: metodoPago as any,
          comprobantePago,
          direccionEnvio,
          telefonoContacto: datosEnvio.telefono || null,
          items: {
            create: items.map((item: any) => ({
              productoId: item.productoId,
              nombreProducto: item.nombreProducto,
              cantidad: item.cantidad,
              precioUnitario: item.precio,
              subtotal: item.precio * item.cantidad,
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
      for (const item of items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: {
            stock: { decrement: item.cantidad },
          },
        });
      }

      return nuevaOrden;
    });

    return successResponse({ orden }, 201);
  } catch (error) {
    console.error("Error al crear orden:", error);
    return errorResponse("Error al crear orden", 500);
  }
}
