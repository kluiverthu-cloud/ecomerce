import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";
import { isValidEmail, successResponse, errorResponse } from "@/lib/utils";

// POST /api/auth/register - Registrar nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nombre, apellido, telefono } = body;

    // Validaciones
    if (!email || !password || !nombre || !apellido) {
      return errorResponse(
        "Campos requeridos: email, password, nombre, apellido",
        400
      );
    }

    if (!isValidEmail(email)) {
      return errorResponse("Email no válido", 400);
    }

    if (password.length < 6) {
      return errorResponse("La contraseña debe tener al menos 6 caracteres", 400);
    }

    // Verificar que el email no exista
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return errorResponse("Ya existe un usuario con ese email", 400);
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        nombre,
        apellido,
        telefono: telefono || null,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        role: true,
      },
    });

    // Crear carrito vacío para el usuario
    await prisma.carrito.create({
      data: { userId: user.id },
    });

    // Obtener usuario completo con telefono
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        role: true,
      },
    });

    // Generar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      {
        token,
        user: fullUser,
      },
      201
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return errorResponse("Error al registrar usuario", 500);
  }
}
