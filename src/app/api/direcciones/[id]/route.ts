import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/direcciones/[id] - Obtener dirección por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const { id } = await params;

    const direccion = await prisma.direccion.findUnique({
      where: { id },
    });

    if (!direccion) {
      return errorResponse("Dirección no encontrada", 404);
    }

    if (direccion.userId !== auth.user.id) {
      return errorResponse("No tienes permiso para ver esta dirección", 403);
    }

    return successResponse(direccion);
  } catch (error) {
    console.error("Error al obtener dirección:", error);
    return errorResponse("Error al obtener dirección", 500);
  }
}

// PUT /api/direcciones/[id] - Actualizar dirección
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const { id } = await params;
    const body = await request.json();

    const direccion = await prisma.direccion.findUnique({
      where: { id },
    });

    if (!direccion) {
      return errorResponse("Dirección no encontrada", 404);
    }

    if (direccion.userId !== auth.user.id) {
      return errorResponse("No tienes permiso para modificar esta dirección", 403);
    }

    const {
      nombre,
      calle,
      numero,
      ciudad,
      estado,
      codigoPostal,
      pais,
      referencia,
      principal,
    } = body;

    const updateData: any = {};

    if (nombre) updateData.nombre = nombre;
    if (calle) updateData.calle = calle;
    if (numero) updateData.numero = numero;
    if (ciudad) updateData.ciudad = ciudad;
    if (estado) updateData.estado = estado;
    if (codigoPostal) updateData.codigoPostal = codigoPostal;
    if (pais) updateData.pais = pais;
    if (referencia !== undefined) updateData.referencia = referencia;

    // Si se marca como principal, quitar de otras
    if (principal === true) {
      await prisma.direccion.updateMany({
        where: { userId: auth.user.id, principal: true, NOT: { id } },
        data: { principal: false },
      });
      updateData.principal = true;
    } else if (principal === false) {
      updateData.principal = false;
    }

    const updatedDireccion = await prisma.direccion.update({
      where: { id },
      data: updateData,
    });

    return successResponse(updatedDireccion);
  } catch (error) {
    console.error("Error al actualizar dirección:", error);
    return errorResponse("Error al actualizar dirección", 500);
  }
}

// DELETE /api/direcciones/[id] - Eliminar dirección
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const { id } = await params;

    const direccion = await prisma.direccion.findUnique({
      where: { id },
    });

    if (!direccion) {
      return errorResponse("Dirección no encontrada", 404);
    }

    if (direccion.userId !== auth.user.id) {
      return errorResponse("No tienes permiso para eliminar esta dirección", 403);
    }

    await prisma.direccion.delete({
      where: { id },
    });

    return successResponse({ message: "Dirección eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar dirección:", error);
    return errorResponse("Error al eliminar dirección", 500);
  }
}
