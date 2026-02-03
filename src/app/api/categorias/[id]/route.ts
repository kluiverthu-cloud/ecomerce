import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { generateSlug, successResponse, errorResponse } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/categorias/[id] - Obtener categoría por ID o slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const categoria = await prisma.categoria.findFirst({
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

    if (!categoria) {
      return errorResponse("Categoría no encontrada", 404);
    }

    return successResponse(categoria);
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    return errorResponse("Error al obtener categoría", 500);
  }
}

// PUT /api/categorias/[id] - Actualizar categoría (solo admin)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.categoria.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse("Categoría no encontrada", 404);
    }

    const { nombre, descripcion, imagen, activo } = body;

    const updateData: any = {};

    if (nombre !== undefined) {
      // Verificar que no exista otro con el mismo nombre
      const duplicate = await prisma.categoria.findFirst({
        where: {
          nombre: { equals: nombre, mode: "insensitive" },
          NOT: { id },
        },
      });

      if (duplicate) {
        return errorResponse("Ya existe una categoría con ese nombre", 400);
      }

      updateData.nombre = nombre;
      updateData.slug = generateSlug(nombre);
    }

    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (imagen !== undefined) updateData.imagen = imagen;
    if (activo !== undefined) updateData.activo = activo;

    const categoria = await prisma.categoria.update({
      where: { id },
      data: updateData,
    });

    return successResponse(categoria);
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    return errorResponse("Error al actualizar categoría", 500);
  }
}

// DELETE /api/categorias/[id] - Eliminar categoría (solo admin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const { id } = await params;

    const existing = await prisma.categoria.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productos: { where: { activo: true } } },
        },
      },
    });

    if (!existing) {
      return errorResponse("Categoría no encontrada", 404);
    }

    // No permitir eliminar si tiene productos activos
    if (existing._count.productos > 0) {
      return errorResponse(
        "No se puede eliminar una categoría con productos activos",
        400
      );
    }

    // Soft delete
    await prisma.categoria.update({
      where: { id },
      data: { activo: false },
    });

    return successResponse({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return errorResponse("Error al eliminar categoría", 500);
  }
}
