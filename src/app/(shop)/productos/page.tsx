import prisma from "@/lib/prisma";
import Link from "next/link";

interface Props {
  searchParams: Promise<{
    categoria?: string;
    marca?: string;
    search?: string;
    page?: string;
  }>;
}

async function getProductos(filters: {
  categoria?: string;
  marca?: string;
  search?: string;
  page?: number;
}) {
  const where: any = { activo: true };

  if (filters.categoria) {
    where.categoria = { slug: filters.categoria };
  }

  if (filters.marca) {
    where.marca = { slug: filters.marca };
  }

  if (filters.search) {
    where.OR = [
      { nombre: { contains: filters.search, mode: "insensitive" } },
      { descripcion: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const page = filters.page || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: {
        categoria: { select: { nombre: true, slug: true } },
        marca: { select: { nombre: true, slug: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.producto.count({ where }),
  ]);

  return { productos, total, totalPages: Math.ceil(total / limit), page };
}

async function getCategorias() {
  return await prisma.categoria.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });
}

async function getMarcas() {
  return await prisma.marca.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });
}

export default async function ProductosPage({ searchParams }: Props) {
  const params = await searchParams;
  const { productos, total, totalPages, page } = await getProductos({
    categoria: params.categoria,
    marca: params.marca,
    search: params.search,
    page: params.page ? parseInt(params.page) : 1,
  });

  const [categorias, marcas] = await Promise.all([getCategorias(), getMarcas()]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
            <h3 className="font-bold text-lg mb-4">Filtros</h3>

            {/* Search */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Buscar
              </label>
              <form>
                <input
                  type="text"
                  name="search"
                  defaultValue={params.search || ""}
                  placeholder="Buscar productos..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </form>
            </div>

            {/* Categorías */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Categorías
              </label>
              <div className="space-y-2">
                <Link
                  href="/productos"
                  className={`block text-sm ${
                    !params.categoria
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Todas las categorías
                </Link>
                {categorias.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/productos?categoria=${cat.slug}`}
                    className={`block text-sm ${
                      params.categoria === cat.slug
                        ? "text-blue-600 font-medium"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                  >
                    {cat.nombre}
                  </Link>
                ))}
              </div>
            </div>

            {/* Marcas */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Marcas
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <Link
                  href={
                    params.categoria
                      ? `/productos?categoria=${params.categoria}`
                      : "/productos"
                  }
                  className={`block text-sm ${
                    !params.marca
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Todas las marcas
                </Link>
                {marcas.map((marca) => (
                  <Link
                    key={marca.id}
                    href={`/productos?${
                      params.categoria ? `categoria=${params.categoria}&` : ""
                    }marca=${marca.slug}`}
                    className={`block text-sm ${
                      params.marca === marca.slug
                        ? "text-blue-600 font-medium"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                  >
                    {marca.nombre}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {params.categoria
                ? categorias.find((c) => c.slug === params.categoria)?.nombre ||
                  "Productos"
                : "Todos los Productos"}
            </h1>
            <span className="text-gray-500 text-sm">{total} productos</span>
          </div>

          {productos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productos.map((producto) => (
                  <Link
                    key={producto.id}
                    href={`/productos/${producto.slug}`}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden group"
                  >
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      {producto.imagenes.length > 0 ? (
                        <img
                          src={producto.imagenes[0]}
                          alt={producto.nombre}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-4xl">📦</span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-blue-600 font-medium mb-1">
                        {producto.marca.nombre}
                      </p>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {producto.nombre}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {producto.categoria.nombre}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        {producto.precioOferta ? (
                          <>
                            <span className="text-lg font-bold text-green-600">
                              Bs. {Number(producto.precioOferta).toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              Bs. {Number(producto.precio).toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">
                            Bs. {Number(producto.precio).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {producto.stock > 0 ? (
                        <span className="text-xs text-green-600 mt-2 inline-block">
                          ✓ En stock ({producto.stock})
                        </span>
                      ) : (
                        <span className="text-xs text-red-500 mt-2 inline-block">
                          Agotado
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {page > 1 && (
                    <Link
                      href={`/productos?${
                        params.categoria ? `categoria=${params.categoria}&` : ""
                      }${params.marca ? `marca=${params.marca}&` : ""}page=${
                        page - 1
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
                      href={`/productos?${
                        params.categoria ? `categoria=${params.categoria}&` : ""
                      }${params.marca ? `marca=${params.marca}&` : ""}page=${
                        page + 1
                      }`}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Siguiente
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-500">
                Intenta con otros filtros o busca otra cosa
              </p>
              <Link
                href="/productos"
                className="mt-4 inline-block text-blue-600 hover:underline"
              >
                Ver todos los productos
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
