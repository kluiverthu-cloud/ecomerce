import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  generateSlug,
  generateSKU,
  parsePaginationParams,
  paginatedResponse,
  successResponse,
  errorResponse,
} from "@/lib/utils";

// GET /api/productos - Listar productos con filtros y paginación
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePaginationParams(searchParams);

    // Filtros
    const categoria = searchParams.get("categoria");
    const marca = searchParams.get("marca");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const destacado = searchParams.get("destacado");
    const orderBy = searchParams.get("orderBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // Construir filtro
    const where: any = {
      activo: true,
    };

    if (categoria) {
      where.categoria = { slug: categoria };
    }

    if (marca) {
      where.marca = { slug: marca };
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { descripcion: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice || maxPrice) {
      where.precio = {};
      if (minPrice) where.precio.gte = parseFloat(minPrice);
      if (maxPrice) where.precio.lte = parseFloat(maxPrice);
    }

    if (destacado === "true") {
      where.destacado = true;
    }

    // Ordenamiento válido
    const validOrderBy = ["createdAt", "precio", "nombre", "stock"];
    const sortField = validOrderBy.includes(orderBy) ? orderBy : "createdAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          categoria: {
            select: { id: true, nombre: true, slug: true },
          },
          marca: {
            select: { id: true, nombre: true, slug: true },
          },
        },
      }),
      prisma.producto.count({ where }),
    ]);

    return successResponse(paginatedResponse(productos, total, page, limit));
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return errorResponse("Error al obtener productos", 500);
  }
}

// POST /api/productos - Crear producto (solo admin)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const body = await request.json();
    const {
      nombre,
      descripcion,
      precio,
      precioOferta,
      stock,
      categoriaId,
      marcaId,
      imagenes,
      destacado,
      specs,
    } = body;

    // Validaciones
    if (!nombre || !descripcion || !precio || !categoriaId || !marcaId) {
      return errorResponse(
        "Campos requeridos: nombre, descripcion, precio, categoriaId, marcaId",
        400
      );
    }

    // Verificar categoría
    const categoria = await prisma.categoria.findUnique({
      where: { id: categoriaId },
    });
    if (!categoria) {
      return errorResponse("Categoría no encontrada", 404);
    }

    // Verificar marca
    const marca = await prisma.marca.findUnique({
      where: { id: marcaId },
    });
    if (!marca) {
      return errorResponse("Marca no encontrada", 404);
    }

    // Generar slug único
    let slug = generateSlug(nombre);
    const existingSlug = await prisma.producto.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Generar SKU
    const sku = generateSKU(categoria.nombre, "");

    const producto = await prisma.producto.create({
      data: {
        nombre,
        slug,
        descripcion,
        precio,
        precioOferta: precioOferta || null,
        stock: stock || 0,
        sku,
        imagenes: imagenes || [],
        destacado: destacado || false,
        categoriaId,
        marcaId,
        specs: specs
          ? {
              create: specs.map((spec: { nombre: string; valor: string }) => ({
                nombre: spec.nombre,
                valor: spec.valor,
              })),
            }
          : undefined,
      },
      include: {
        categoria: { select: { id: true, nombre: true, slug: true } },
        marca: { select: { id: true, nombre: true, slug: true } },
        specs: true,
      },
    });

    return successResponse(producto, 201);
  } catch (error) {
    console.error("Error al crear producto:", error);
    return errorResponse("Error al crear producto", 500);
  }
}
