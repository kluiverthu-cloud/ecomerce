import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ProductActions } from "@/components/admin/ProductActions";

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

async function getProductos(page: number, search?: string) {
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: {
        categoria: { select: { nombre: true } },
        marca: { select: { nombre: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.producto.count({ where }),
  ]);

  return { productos, total, totalPages: Math.ceil(total / limit), page };
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const { productos, total, totalPages } = await getProductos(
    page,
    params.search
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
          <p className="text-gray-500">{total} productos en total</p>
        </div>
        <Link
          href="/products/nuevo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nuevo Producto
        </Link>
      </div>

      {/* Búsqueda */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <form className="flex gap-4">
          <input
            type="text"
            name="search"
            defaultValue={params.search || ""}
            placeholder="Buscar por nombre o SKU..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Producto
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                SKU
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Categoría
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Precio
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Stock
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Estado
              </th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr
                key={producto.id}
                className="border-b border-gray-50 hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {producto.imagenes.length > 0 ? (
                        <img
                          src={producto.imagenes[0]}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400">📦</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {producto.nombre}
                      </p>
                      <p className="text-sm text-gray-500">
                        {producto.marca.nombre}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {producto.sku}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {producto.categoria.nombre}
                </td>
                <td className="px-6 py-4">
                  {producto.precioOferta ? (
                    <div>
                      <span className="font-medium text-green-600">
                        Bs. {Number(producto.precioOferta).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400 line-through ml-2">
                        Bs. {Number(producto.precio).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="font-medium text-gray-900">
                      Bs. {Number(producto.precio).toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${producto.stock === 0
                      ? "bg-red-100 text-red-700"
                      : producto.stock <= 5
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                      }`}
                  >
                    {producto.stock} uds
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${producto.activo
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {producto.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">

                    <ProductActions
                      product={{
                        id: producto.id,
                        slug: producto.slug,
                        activo: producto.activo,
                        nombre: producto.nombre
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {productos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron productos
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/products?page=${page - 1}${params.search ? `&search=${params.search}` : ""
                }`}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Anterior
            </Link>
          )}
          <span className="px-4 py-2 text-gray-600">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/products?page=${page + 1}${params.search ? `&search=${params.search}` : ""
                }`}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Siguiente
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
