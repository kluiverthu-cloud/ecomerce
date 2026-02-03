import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { generateSlug, successResponse, errorResponse } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/productos/[id] - Obtener producto por ID o slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Buscar por ID o por slug
    const producto = await prisma.producto.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        activo: true,
      },
      include: {
        categoria: { select: { id: true, nombre: true, slug: true } },
        marca: { select: { id: true, nombre: true, slug: true, logo: true } },
        specs: { select: { id: true, nombre: true, valor: true } },
      },
    });

    if (!producto) {
      return errorResponse("Producto no encontrado", 404);
    }

    return successResponse(producto);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return errorResponse("Error al obtener producto", 500);
  }
}

// PUT /api/productos/[id] - Actualizar producto (solo admin)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const { id } = await params;
    const body = await request.json();

    // Verificar que el producto existe
    const existingProduct = await prisma.producto.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return errorResponse("Producto no encontrado", 404);
    }

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
      activo,
      specs,
    } = body;

    // Preparar datos de actualización
    const updateData: any = {};

    if (nombre !== undefined) {
      updateData.nombre = nombre;
      // Si cambia el nombre, actualizar slug
      let newSlug = generateSlug(nombre);
      const existingSlug = await prisma.producto.findFirst({
        where: { slug: newSlug, NOT: { id } },
      });
      if (existingSlug) {
        newSlug = `${newSlug}-${Date.now().toString(36)}`;
      }
      updateData.slug = newSlug;
    }

    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (precio !== undefined) updateData.precio = precio;
    if (precioOferta !== undefined) updateData.precioOferta = precioOferta;
    if (stock !== undefined) updateData.stock = stock;
    if (imagenes !== undefined) updateData.imagenes = imagenes;
    if (destacado !== undefined) updateData.destacado = destacado;
    if (activo !== undefined) updateData.activo = activo;

    // Verificar categoría si se proporciona
    if (categoriaId) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: categoriaId },
      });
      if (!categoria) {
        return errorResponse("Categoría no encontrada", 404);
      }
      updateData.categoriaId = categoriaId;
    }

    // Verificar marca si se proporciona
    if (marcaId) {
      const marca = await prisma.marca.findUnique({
        where: { id: marcaId },
      });
      if (!marca) {
        return errorResponse("Marca no encontrada", 404);
      }
      updateData.marcaId = marcaId;
    }

    // Actualizar producto
    const producto = await prisma.producto.update({
      where: { id },
      data: updateData,
      include: {
        categoria: { select: { id: true, nombre: true, slug: true } },
        marca: { select: { id: true, nombre: true, slug: true } },
        specs: true,
      },
    });

    // Actualizar especificaciones si se proporcionan
    if (specs !== undefined) {
      // Eliminar specs existentes
      await prisma.especificacion.deleteMany({
        where: { productoId: id },
      });

      // Crear nuevas specs
      if (specs.length > 0) {
        await prisma.especificacion.createMany({
          data: specs.map((spec: { nombre: string; valor: string }) => ({
            productoId: id,
            nombre: spec.nombre,
            valor: spec.valor,
          })),
        });
      }

      // Obtener producto actualizado con specs
      const productoConSpecs = await prisma.producto.findUnique({
        where: { id },
        include: {
          categoria: { select: { id: true, nombre: true, slug: true } },
          marca: { select: { id: true, nombre: true, slug: true } },
          specs: true,
        },
      });

      return successResponse(productoConSpecs);
    }

    return successResponse(producto);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return errorResponse("Error al actualizar producto", 500);
  }
}

// DELETE /api/productos/[id] - Eliminar producto (solo admin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin(request);
    if ("error" in auth) {
      return errorResponse(auth.error, auth.status);
    }

    const { id } = await params;

    // Verificar que el producto existe
    const existingProduct = await prisma.producto.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return errorResponse("Producto no encontrado", 404);
    }

    // Hard delete
    await prisma.producto.delete({
      where: { id },
    });

    return successResponse({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return errorResponse("Error al eliminar producto", 500);
  }
}
