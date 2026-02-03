import prisma from "@/lib/prisma";
import Link from "next/link";

async function getCategorias() {
  return await prisma.categoria.findMany({
    where: { activo: true },
    take: 4,
  });
}

async function getProductosDestacados() {
  return await prisma.producto.findMany({
    where: { activo: true, destacado: true },
    include: {
      categoria: { select: { nombre: true, slug: true } },
      marca: { select: { nombre: true } },
    },
    take: 4,
  });
}

export default async function ShopHome() {
  const [categorias, productosDestacados] = await Promise.all([
    getCategorias(),
    getProductosDestacados(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#f0f7ff] rounded-3xl p-12 mb-12 border border-blue-50">
        <div className="relative z-10">
          <h1 className="text-6xl font-black mb-4 tracking-tighter text-slate-900">
            Bienvenido a <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Tech Store</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-xl font-medium">
            Descubre la mejor selección de tecnología con el respaldo y la confianza que mereces.
          </p>
          <Link
            href="/productos"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1 inline-block"
          >
            Explorar Tienda
          </Link>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-100/50 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Categories Grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Categorías Populares</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              href={`/productos?categoria=${cat.slug}`}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 text-center group"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <span className="text-2xl">💻</span>
              </div>
              <h3 className="font-semibold">{cat.nombre}</h3>
              {cat.descripcion && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {cat.descripcion}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Productos Destacados</h2>
          <Link
            href="/productos"
            className="text-blue-600 hover:underline font-medium"
          >
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productosDestacados.length > 0 ? (
            productosDestacados.map((producto) => (
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
                      ✓ En stock
                    </span>
                  ) : (
                    <span className="text-xs text-red-500 mt-2 inline-block">
                      Agotado
                    </span>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-4 text-center py-12 text-gray-500">
              No hay productos destacados disponibles
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
