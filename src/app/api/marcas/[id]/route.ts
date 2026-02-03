import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { generateSlug, successResponse, errorResponse } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/marcas/[id] - Obtener marca por ID o slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const marca = await prisma.marca.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        activo: true,
      },
      include: {
        _count: {
          select: { productos: { where: { activo: true } } },
        },
      },
    });

    if (!marca) {
      return errorResponse("Marca no encontrada", 404);
    }

    return successResponse(marca);
  } catch (error) {
    console.error("Error al obtener marca:", error);
    return errorResponse("Error al obtener marca", 500);
  }
}

// PUT /api/marcas/[id] - Actualizar marca (solo admin)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.marca.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse("Marca no encontrada", 404);
    }

    const { nombre, logo, activo } = body;

    const updateData: any = {};

    if (nombre !== undefined) {
      const duplicate = await prisma.marca.findFirst({
        where: {
          nombre: { equals: nombre, mode: "insensitive" },
          NOT: { id },
        },
      });

      if (duplicate) {
        return errorResponse("Ya existe una marca con ese nombre", 400);
      }

      updateData.nombre = nombre;
      updateData.slug = generateSlug(nombre);
    }

    if (logo !== undefined) updateData.logo = logo;
    if (activo !== undefined) updateData.activo = activo;

    const marca = await prisma.marca.update({
      where: { id },
      data: updateData,
    });

    return successResponse(marca);
  } catch (error) {
    console.error("Error al actualizar marca:", error);
    return errorResponse("Error al actualizar marca", 500);
  }
}

// DELETE /api/marcas/[id] - Eliminar marca (solo admin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const { id } = await params;

    const existing = await prisma.marca.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productos: { where: { activo: true } } },
        },
      },
    });

    if (!existing) {
      return errorResponse("Marca no encontrada", 404);
    }

    if (existing._count.productos > 0) {
      return errorResponse(
        "No se puede eliminar una marca con productos activos",
        400
      );
    }

    await prisma.marca.update({
      where: { id },
      data: { activo: false },
    });

    return successResponse({ message: "Marca eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar marca:", error);
    return errorResponse("Error al eliminar marca", 500);
  }
}
