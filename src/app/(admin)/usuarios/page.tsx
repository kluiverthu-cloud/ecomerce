import prisma from "@/lib/prisma";
import Link from "next/link";
import { Users, Eye, Shield, User } from "lucide-react";

interface Props {
  searchParams: Promise<{ role?: string; page?: string }>;
}

async function getUsuarios(role?: string, page: number = 1) {
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (role && (role === "ADMIN" || role === "CUSTOMER")) {
    where.role = role;
  }

  const [usuarios, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        role: true,
        activo: true,
        createdAt: true,
        _count: { select: { ordenes: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { usuarios, total, totalPages: Math.ceil(total / limit), page };
}

export default async function UsuariosPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const { usuarios, total, totalPages } = await getUsuarios(params.role, page);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
          <p className="text-gray-500">{total} usuarios registrados</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex gap-2">
          <Link
            href="/usuarios"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!params.role
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Todos
          </Link>
          <Link
            href="/usuarios?role=CUSTOMER"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${params.role === "CUSTOMER"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Clientes
          </Link>
          <Link
            href="/usuarios?role=ADMIN"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${params.role === "ADMIN"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Administradores
          </Link>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-50/50 border-b border-blue-100">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">
                Usuario
              </th>
              <th className="text-left px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="text-left px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">
                Rol
              </th>
              <th className="text-left px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">
                Órdenes
              </th>
              <th className="text-left px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">
                Estado
              </th>
              <th className="text-left px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">
                Registro
              </th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr
                key={usuario.id}
                className="border-b border-gray-50 hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${usuario.role === "ADMIN"
                        ? "bg-purple-100"
                        : "bg-blue-100"
                        }`}
                    >
                      {usuario.role === "ADMIN" ? (
                        <Shield size={20} className="text-purple-600" />
                      ) : (
                        <User size={20} className="text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {usuario.nombre} {usuario.apellido}
                      </p>
                      <p className="text-sm text-gray-500">{usuario.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {usuario.telefono || "-"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${usuario.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {usuario.role === "ADMIN" ? "Admin" : "Cliente"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {usuario._count.ordenes} órdenes
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${usuario.activo
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(usuario.createdAt).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuarios.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron usuarios
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/usuarios?${params.role ? `role=${params.role}&` : ""}page=${page - 1}`}
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
              href={`/usuarios?${params.role ? `role=${params.role}&` : ""}page=${page + 1}`}
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
