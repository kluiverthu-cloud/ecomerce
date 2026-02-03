import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { generateSlug, successResponse, errorResponse } from "@/lib/utils";

// GET /api/categorias - Listar todas las categorías
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      include: {
        _count: {
          select: { productos: { where: { activo: true } } },
        },
      },
    });

    return successResponse(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return errorResponse("Error al obtener categorías", 500);
  }
}

// POST /api/categorias - Crear categoría (solo admin)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const body = await request.json();
    const { nombre, descripcion, imagen } = body;

    if (!nombre) {
      return errorResponse("El nombre es requerido", 400);
    }

    // Verificar que no exista
    const existing = await prisma.categoria.findFirst({
      where: {
        OR: [
          { nombre: { equals: nombre, mode: "insensitive" } },
        ],
      },
    });

    if (existing) {
      return errorResponse("Ya existe una categoría con ese nombre", 400);
    }

    // Generar slug
    const slug = generateSlug(nombre);

    const categoria = await prisma.categoria.create({
      data: {
        nombre,
        slug,
        descripcion: descripcion || null,
        imagen: imagen || null,
      },
    });

    return successResponse(categoria, 201);
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return errorResponse("Error al crear categoría", 500);
  }
}
