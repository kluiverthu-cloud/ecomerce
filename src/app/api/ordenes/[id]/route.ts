import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/ordenes/[id] - Obtener orden por ID o número
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const { id } = await params;

    const orden = await prisma.orden.findFirst({
      where: {
        OR: [{ id }, { numeroOrden: id }],
      },
      include: {
        user: {
          select: { id: true, nombre: true, apellido: true, email: true, telefono: true },
        },
        items: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                slug: true,
                imagenes: true,
              },
            },
          },
        },
      },
    });

    if (!orden) {
      return errorResponse("Orden no encontrada", 404);
    }

    // Verificar permisos (solo el dueño o admin)
    if (orden.userId !== auth.user.id && auth.user.role !== "ADMIN") {
      return errorResponse("No tienes permiso para ver esta orden", 403);
    }

    return successResponse(orden);
  } catch (error) {
    console.error("Error al obtener orden:", error);
    return errorResponse("Error al obtener orden", 500);
  }
}

// PUT /api/ordenes/[id] - Actualizar orden (solo admin o cliente para comprobante)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const { id } = await params;
    const body = await request.json();

    const orden = await prisma.orden.findUnique({
      where: { id },
    });

    if (!orden) {
      return errorResponse("Orden no encontrada", 404);
    }

    const { estado, comprobantePago } = body;

    // Si es cliente, solo puede subir comprobante de pago
    if (auth.user.role !== "ADMIN") {
      if (orden.userId !== auth.user.id) {
        return errorResponse("No tienes permiso para modificar esta orden", 403);
      }

      // Cliente solo puede agregar comprobante si está pendiente
      if (comprobantePago && orden.estado === "PENDIENTE") {
        const updatedOrden = await prisma.orden.update({
          where: { id },
          data: {
            comprobantePago,
            estado: "VERIFICANDO",
          },
        });
        return successResponse(updatedOrden);
      }

      return errorResponse("No puedes modificar esta orden", 400);
    }

    // Admin puede cambiar estado
    const updateData: any = {};

    if (estado) {
      const validEstados = [
        "PENDIENTE",
        "VERIFICANDO",
        "PAGADO",
        "PROCESANDO",
        "ENVIADO",
        "ENTREGADO",
        "CANCELADO",
      ];

      if (!validEstados.includes(estado)) {
        return errorResponse("Estado no válido", 400);
      }

      // Si se cancela, restaurar stock
      if (estado === "CANCELADO" && orden.estado !== "CANCELADO") {
        const items = await prisma.ordenItem.findMany({
          where: { ordenId: id },
        });

        for (const item of items) {
          await prisma.producto.update({
            where: { id: item.productoId },
            data: {
              stock: { increment: item.cantidad },
            },
          });
        }
      }

      updateData.estado = estado;
    }

    if (comprobantePago !== undefined) {
      updateData.comprobantePago = comprobantePago;
    }

    const updatedOrden = await prisma.orden.update({
      where: { id },
      data: updateData,
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
    });

    return successResponse(updatedOrden);
  } catch (error) {
    console.error("Error al actualizar orden:", error);
    return errorResponse("Error al actualizar orden", 500);
  }
}
