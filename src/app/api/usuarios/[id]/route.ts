import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/usuarios/[id] - Obtener usuario por ID (solo admin)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const { id } = await params;

    const usuario = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        role: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
        direcciones: true,
        ordenes: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            numeroOrden: true,
            total: true,
            estado: true,
            createdAt: true,
          },
        },
        _count: {
          select: { ordenes: true },
        },
      },
    });

    if (!usuario) {
      return errorResponse("Usuario no encontrado", 404);
    }

    return successResponse(usuario);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return errorResponse("Error al obtener usuario", 500);
  }
}

// PUT /api/usuarios/[id] - Actualizar usuario (solo admin)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse("Usuario no encontrado", 404);
    }

    const { nombre, apellido, telefono, role, activo } = body;

    const updateData: any = {};

    if (nombre) updateData.nombre = nombre;
    if (apellido) updateData.apellido = apellido;
    if (telefono !== undefined) updateData.telefono = telefono;

    if (role && (role === "ADMIN" || role === "CUSTOMER")) {
      updateData.role = role;
    }

    if (activo !== undefined) {
      updateData.activo = activo;
    }

    const usuario = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        role: true,
        activo: true,
      },
    });

    return successResponse(usuario);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return errorResponse("Error al actualizar usuario", 500);
  }
}

// DELETE /api/usuarios/[id] - Desactivar usuario (solo admin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const { id } = await params;

    // No permitir eliminarse a sí mismo
    if (id === auth.user.id) {
      return errorResponse("No puedes desactivar tu propia cuenta", 400);
    }

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse("Usuario no encontrado", 404);
    }

    // Soft delete
    await prisma.user.update({
      where: { id },
      data: { activo: false },
    });

    return successResponse({ message: "Usuario desactivado correctamente" });
  } catch (error) {
    console.error("Error al desactivar usuario:", error);
    return errorResponse("Error al desactivar usuario", 500);
  }
}
