import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, hashPassword, authenticateRequest } from "@/lib/auth";
import {
  isValidEmail,
  parsePaginationParams,
  paginatedResponse,
  successResponse,
  errorResponse,
} from "@/lib/utils";

// GET /api/usuarios - Listar usuarios (solo admin)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePaginationParams(searchParams);

    const search = searchParams.get("search");
    const role = searchParams.get("role");

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { nombre: { contains: search, mode: "insensitive" } },
        { apellido: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role && (role === "ADMIN" || role === "CUSTOMER")) {
      where.role = role;
    }

    const [usuarios, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          telefono: true,
          role: true,
          activo: true,
          createdAt: true,
          _count: {
            select: { ordenes: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse(paginatedResponse(usuarios, total, page, limit));
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return errorResponse("Error al obtener usuarios", 500);
  }
}

// PUT /api/usuarios - Actualizar perfil del usuario actual
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const body = await request.json();
    const { nombre, apellido, telefono, password, currentPassword } = body;

    const updateData: any = {};

    if (nombre) updateData.nombre = nombre;
    if (apellido) updateData.apellido = apellido;
    if (telefono !== undefined) updateData.telefono = telefono;

    // Cambio de contraseña
    if (password) {
      if (!currentPassword) {
        return errorResponse(
          "Debes proporcionar la contraseña actual para cambiarla",
          400
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: auth.user.id },
      });

      if (!user) {
        return errorResponse("Usuario no encontrado", 404);
      }

      const { verifyPassword } = await import("@/lib/auth");
      const isValid = await verifyPassword(currentPassword, user.password);

      if (!isValid) {
        return errorResponse("La contraseña actual es incorrecta", 400);
      }

      if (password.length < 6) {
        return errorResponse(
          "La nueva contraseña debe tener al menos 6 caracteres",
          400
        );
      }

      updateData.password = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: auth.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        role: true,
      },
    });

    return successResponse(updatedUser);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return errorResponse("Error al actualizar usuario", 500);
  }
}
