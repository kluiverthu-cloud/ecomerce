import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

// GET /api/direcciones - Obtener direcciones del usuario
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const direcciones = await prisma.direccion.findMany({
      where: { userId: auth.user.id },
      orderBy: [{ principal: "desc" }, { createdAt: "desc" }],
    });

    return successResponse(direcciones);
  } catch (error) {
    console.error("Error al obtener direcciones:", error);
    return errorResponse("Error al obtener direcciones", 500);
  }
}

// POST /api/direcciones - Crear nueva dirección
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const body = await request.json();
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

    // Validaciones
    if (!nombre || !calle || !numero || !ciudad || !estado || !codigoPostal) {
      return errorResponse(
        "Campos requeridos: nombre, calle, numero, ciudad, estado, codigoPostal",
        400
      );
    }

    // Si es principal, quitar principal de otras direcciones
    if (principal) {
      await prisma.direccion.updateMany({
        where: { userId: auth.user.id, principal: true },
        data: { principal: false },
      });
    }

    const direccion = await prisma.direccion.create({
      data: {
        userId: auth.user.id,
        nombre,
        calle,
        numero,
        ciudad,
        estado,
        codigoPostal,
        pais: pais || "Bolivia",
        referencia: referencia || null,
        principal: principal || false,
      },
    });

    return successResponse(direccion, 201);
  } catch (error) {
    console.error("Error al crear dirección:", error);
    return errorResponse("Error al crear dirección", 500);
  }
}
