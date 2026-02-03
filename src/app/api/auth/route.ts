import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  authenticateRequest,
} from "@/lib/auth";
import { isValidEmail, successResponse, errorResponse } from "@/lib/utils";

// POST /api/auth - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse("Email y contraseña son requeridos", 400);
    }

    if (!isValidEmail(email)) {
      return errorResponse("Email no válido", 400);
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return errorResponse("Credenciales incorrectas", 401);
    }

    if (!user.activo) {
      return errorResponse("Tu cuenta ha sido desactivada", 403);
    }

    // Verificar contraseña
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return errorResponse("Credenciales incorrectas", 401);
    }

    // Generar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return errorResponse("Error al iniciar sesión", 500);
  }
}

// GET /api/auth - Obtener usuario actual
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    // Obtener datos completos del usuario
    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        role: true,
        createdAt: true,
        direcciones: {
          where: { principal: true },
          take: 1,
        },
        _count: {
          select: { ordenes: true },
        },
      },
    });

    return successResponse(user);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return errorResponse("Error al obtener usuario", 500);
  }
}
