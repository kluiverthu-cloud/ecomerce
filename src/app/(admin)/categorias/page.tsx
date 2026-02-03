import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Trash2, FolderTree } from "lucide-react";

async function getCategorias() {
  return await prisma.categoria.findMany({
    include: {
      _count: { select: { productos: true } },
    },
    orderBy: { nombre: "asc" },
  });
}

export default async function CategoriasPage() {
  const categorias = await getCategorias();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
          <p className="text-gray-500">{categorias.length} categorías</p>
        </div>
        <Link
          href="/categorias/nueva"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nueva Categoría
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  {cat.imagen ? (
                    <img
                      src={cat.imagen}
                      alt={cat.nombre}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <FolderTree size={24} className="text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{cat.nombre}</h3>
                  <p className="text-sm text-gray-500">/{cat.slug}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  cat.activo
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {cat.activo ? "Activa" : "Inactiva"}
              </span>
            </div>

            {cat.descripcion && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {cat.descripcion}
              </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                {cat._count.productos} productos
              </span>
              <div className="flex gap-2">
                <Link
                  href={`/categorias/${cat.id}/editar`}
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Edit size={18} />
                </Link>
                <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categorias.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <FolderTree size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No hay categorías creadas</p>
          <Link
            href="/categorias/nueva"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Crear primera categoría
          </Link>
        </div>
      )}
    </div>
  );
}
