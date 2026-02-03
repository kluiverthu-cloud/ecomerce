import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { generateSlug, successResponse, errorResponse } from "@/lib/utils";

// GET /api/marcas - Listar todas las marcas
export async function GET() {
  try {
    const marcas = await prisma.marca.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      include: {
        _count: {
          select: { productos: { where: { activo: true } } },
        },
      },
    });

    return successResponse(marcas);
  } catch (error) {
    console.error("Error al obtener marcas:", error);
    return errorResponse("Error al obtener marcas", 500);
  }
}

// POST /api/marcas - Crear marca (solo admin)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const body = await request.json();
    const { nombre, logo } = body;

    if (!nombre) {
      return errorResponse("El nombre es requerido", 400);
    }

    // Verificar que no exista
    const existing = await prisma.marca.findFirst({
      where: {
        nombre: { equals: nombre, mode: "insensitive" },
      },
    });

    if (existing) {
      return errorResponse("Ya existe una marca con ese nombre", 400);
    }

    const slug = generateSlug(nombre);

    const marca = await prisma.marca.create({
      data: {
        nombre,
        slug,
        logo: logo || null,
      },
    });

    return successResponse(marca, 201);
  } catch (error) {
    console.error("Error al crear marca:", error);
    return errorResponse("Error al crear marca", 500);
  }
}
