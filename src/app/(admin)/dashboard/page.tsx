import prisma from "@/lib/prisma";
import { Users, DollarSign, ShoppingBag, Package } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  const [totalUsuarios, totalProductos, totalOrdenes, ordenesPendientes] =
    await Promise.all([
      prisma.user.count({ where: { activo: true } }),
      prisma.producto.count({ where: { activo: true } }),
      prisma.orden.count(),
      prisma.orden.count({ where: { estado: "PENDIENTE" } }),
    ]);

  const ventasTotales = await prisma.orden.aggregate({
    where: { estado: { in: ["PAGADO", "PROCESANDO", "ENVIADO", "ENTREGADO"] } },
    _sum: { total: true },
  });

  return {
    totalUsuarios,
    totalProductos,
    totalOrdenes,
    ordenesPendientes,
    ventasTotales: ventasTotales._sum.total || 0,
  };
}

async function getOrdenesRecientes() {
  return await prisma.orden.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { nombre: true, apellido: true, email: true } },
    },
  });
}

async function getProductosBajoStock() {
  return await prisma.producto.findMany({
    where: { activo: true, stock: { lte: 5 } },
    take: 5,
    orderBy: { stock: "asc" },
    include: {
      categoria: { select: { nombre: true } },
    },
  });
}

export default async function DashboardPage() {
  const [stats, ordenesRecientes, productosBajoStock] = await Promise.all([
    getStats(),
    getOrdenesRecientes(),
    getProductosBajoStock(),
  ]);

  const estadoColors: Record<string, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-700",
    VERIFICANDO: "bg-blue-100 text-blue-700",
    PAGADO: "bg-green-100 text-green-700",
    PROCESANDO: "bg-purple-100 text-purple-700",
    ENVIADO: "bg-indigo-100 text-indigo-700",
    ENTREGADO: "bg-teal-100 text-teal-700",
    CANCELADO: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Ventas Totales</p>
            <p className="text-xl font-bold text-gray-800">
              Bs. {Number(stats.ventasTotales).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Órdenes</p>
            <p className="text-xl font-bold text-gray-800">
              {stats.totalOrdenes}
              {stats.ordenesPendientes > 0 && (
                <span className="text-sm text-yellow-600 ml-2">
                  ({stats.ordenesPendientes} pendientes)
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Usuarios</p>
            <p className="text-xl font-bold text-gray-800">
              {stats.totalUsuarios}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 rounded-full bg-orange-100 text-orange-600">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Productos</p>
            <p className="text-xl font-bold text-gray-800">
              {stats.totalProductos}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Órdenes Recientes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Órdenes Recientes
          </h2>
          {ordenesRecientes.length > 0 ? (
            <div className="space-y-3">
              {ordenesRecientes.map((orden) => (
                <div
                  key={orden.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {orden.numeroOrden}
                    </p>
                    <p className="text-sm text-gray-500">
                      {orden.user.nombre} {orden.user.apellido}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(orden.createdAt).toLocaleDateString("es-BO")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${estadoColors[orden.estado]
                        }`}
                    >
                      {orden.estado}
                    </span>
                    <p className="font-bold text-gray-900 mt-1">
                      Bs. {Number(orden.total).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No hay órdenes todavía
            </p>
          )}
        </div>

        {/* Productos con Bajo Stock */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            ⚠️ Bajo Stock
          </h2>
          {productosBajoStock.length > 0 ? (
            <div className="space-y-3">
              {productosBajoStock.map((producto) => (
                <div
                  key={producto.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      {producto.imagenes.length > 0 ? (
                        <img
                          src={producto.imagenes[0]}
                          alt={producto.nombre}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-gray-400">📦</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 line-clamp-1">
                        {producto.nombre}
                      </p>
                      <p className="text-sm text-gray-500">
                        {producto.categoria.nombre}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${producto.stock === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {producto.stock} uds
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              ✅ Todos los productos tienen stock suficiente
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
