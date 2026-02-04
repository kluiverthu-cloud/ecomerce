import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { ProductGallery } from "@/components/shop/ProductGallery";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProducto(slug: string) {
  return await prisma.producto.findUnique({
    where: { slug, activo: true },
    include: {
      categoria: { select: { nombre: true, slug: true } },
      marca: { select: { nombre: true, slug: true, logo: true } },
      specs: { select: { nombre: true, valor: true } },
    },
  });
}

async function getProductosRelacionados(categoriaId: string, productoId: string) {
  return await prisma.producto.findMany({
    where: {
      categoriaId,
      activo: true,
      NOT: { id: productoId },
    },
    include: {
      marca: { select: { nombre: true } },
    },
    take: 4,
  });
}

export default async function ProductoDetalle({ params }: Props) {
  const { slug } = await params;
  const producto = await getProducto(slug);

  if (!producto) {
    notFound();
  }

  const relacionados = await getProductosRelacionados(
    producto.categoriaId,
    producto.id
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/productos" className="hover:text-blue-600">
          Productos
        </Link>
        <span>/</span>
        <Link
          href={`/productos?categoria=${producto.categoria.slug}`}
          className="hover:text-blue-600"
        >
          {producto.categoria.nombre}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{producto.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Galería de Imágenes Interactiva */}
        <ProductGallery imagenes={producto.imagenes} nombre={producto.nombre} />

        {/* Información del Producto */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/productos?marca=${producto.marca.slug}`}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              {producto.marca.nombre}
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-sm">SKU: {producto.sku}</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {producto.nombre}
          </h1>

          {/* Precio */}
          <div className="mb-6">
            {producto.precioOferta ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-green-600">
                  Bs. {Number(producto.precioOferta).toLocaleString()}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  Bs. {Number(producto.precio).toLocaleString()}
                </span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">
                  {Math.round(
                    ((Number(producto.precio) - Number(producto.precioOferta)) /
                      Number(producto.precio)) *
                    100
                  )}
                  % OFF
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                Bs. {Number(producto.precio).toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="mb-6">
            {producto.stock > 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="font-medium">
                  En stock ({producto.stock} disponibles)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-500">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="font-medium">Agotado</span>
              </div>
            )}
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
            <p className="text-gray-600 leading-relaxed">{producto.descripcion}</p>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1">
              <AddToCartButton
                product={{
                  id: producto.id,
                  nombre: producto.nombre,
                  slug: producto.slug,
                  precio: Number(producto.precio),
                  precioOferta: producto.precioOferta ? Number(producto.precioOferta) : null,
                  imagen: producto.imagenes[0] || "",
                  stock: producto.stock,
                }}
                className="w-full"
              />
            </div>
          </div>

          {/* Especificaciones */}
          {producto.specs.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Especificaciones
              </h3>
              <div className="space-y-3">
                {producto.specs.map((spec, i) => (
                  <div
                    key={i}
                    className="flex justify-between py-2 border-b border-gray-200 last:border-0"
                  >
                    <span className="text-gray-600">{spec.nombre}</span>
                    <span className="font-medium text-gray-900">{spec.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Productos Relacionados */}
      {relacionados.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Productos Relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relacionados.map((prod) => (
              <Link
                key={prod.id}
                href={`/productos/${prod.slug}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden group"
              >
                <div className="h-40 bg-gray-100 flex items-center justify-center">
                  {prod.imagenes.length > 0 ? (
                    <img
                      src={prod.imagenes[0]}
                      alt={prod.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-3xl">📦</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-blue-600 font-medium mb-1">
                    {prod.marca.nombre}
                  </p>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm">
                    {prod.nombre}
                  </h3>
                  <div className="mt-2">
                    <span className="font-bold text-gray-900">
                      Bs. {Number(prod.precioOferta || prod.precio).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
