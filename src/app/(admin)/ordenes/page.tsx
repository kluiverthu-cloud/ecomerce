import prisma from "@/lib/prisma";
import Link from "next/link";
import { Eye, Package } from "lucide-react"; interface Props {
  searchParams: Promise<{ estado?: string; page?: string }>;
}async function getOrdenes(estado?: string, page: number = 1) {
  const limit = 15;
  const skip = (page - 1) * limit; const where: any = {};
  if (estado) {
    where.estado = estado;
  } const [ordenes, total] = await Promise.all([
    prisma.orden.findMany({
      where,
      include: {
        user: { select: { nombre: true, apellido: true, email: true } },
        _count: { select: { items: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.orden.count({ where }),
  ]); return { ordenes, total, totalPages: Math.ceil(total / limit), page };
} export default async function OrdenesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const { ordenes, total, totalPages } = await getOrdenes(undefined, page); const estadoColors: Record<string, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-700",
    VERIFICANDO: "bg-blue-100 text-blue-700",
    PAGADO: "bg-green-100 text-green-700",
    PROCESANDO: "bg-purple-100 text-purple-700",
    ENVIADO: "bg-indigo-100 text-indigo-700",
    ENTREGADO: "bg-teal-100 text-teal-700",
    CANCELADO: "bg-red-100 text-red-700",
  }; return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Órdenes</h1>
          <p className="text-gray-500">{total} órdenes en total</p>
        </div>
      </div>
      {/* Tabla de Órdenes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-50/50 border-b border-blue-100">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Orden</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Cliente</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Items</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Total</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Estado</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((orden) => (
              <tr
                key={orden.id}
                className="border-b border-gray-50 hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <Link href={`/ordenes/${orden.id}`} className="font-medium text-blue-600 hover:underline">
                        {orden.numeroOrden}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {orden.metodoPago}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900">
                    {orden.user.nombre} {orden.user.apellido}
                  </p>
                  <p className="text-xs text-gray-500">{orden.user.email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {orden._count.items} productos
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  Bs. {Number(orden.total).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${estadoColors[orden.estado]
                      }`}
                  >
                    {orden.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(orden.createdAt).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>        {ordenes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron órdenes
          </div>
        )}
      </div>      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/ordenes?page=${page - 1}`}
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
              href={`/ordenes?page=${page + 1}`}
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
