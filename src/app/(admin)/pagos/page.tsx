import prisma from "@/lib/prisma";
import Link from "next/link";
import { QrCode, Eye, Check, X, Clock, Upload } from "lucide-react";
import { OrderActions } from "@/components/admin/OrderActions";

export const dynamic = "force-dynamic";

async function getOrdenesPendientes() {
  return await prisma.orden.findMany({
    where: {
      estado: { in: ["PENDIENTE", "VERIFICANDO"] },
    },
    include: {
      user: { select: { nombre: true, apellido: true, email: true } },
      items: {
        include: {
          producto: { select: { nombre: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getOrdenesVerificadas() {
  return await prisma.orden.findMany({
    where: {
      estado: { in: ["PAGADO", "PROCESANDO", "ENVIADO"] },
    },
    include: {
      user: { select: { nombre: true, apellido: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });
}

async function getConfigQR() {
  try {
    const config = await prisma.configuracion.findFirst({
      where: { clave: "qr_pago" },
    });

    if (config && config.valor) {
      // Manejar tanto si es un objeto JSON como si es un string guardado en el campo JSON
      const valor = config.valor;
      return typeof valor === "string" ? JSON.parse(valor) : valor;
    }

    return {
      qrImageUrl: null,
      banco: "Tigo Money",
      titular: "Tech Store S.R.L.",
      nroCuenta: "70123456",
    };
  } catch (error) {
    console.error("Error al obtener config QR:", error);
    return {
      qrImageUrl: null,
      banco: "Error al cargar",
      titular: "-",
      nroCuenta: "-",
    };
  }
}

export default async function PagosPage() {
  const [ordenesPendientes, ordenesVerificadas, configQR] = await Promise.all([
    getOrdenesPendientes(),
    getOrdenesVerificadas(),
    getConfigQR(),
  ]);

  const estadoColors: Record<string, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-700",
    VERIFICANDO: "bg-blue-100 text-blue-700",
    PAGADO: "bg-green-100 text-green-700",
    PROCESANDO: "bg-purple-100 text-purple-700",
    ENVIADO: "bg-indigo-100 text-indigo-700",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Gestión de Pagos QR
        </h1>
        <p className="text-gray-500">
          Verifica los comprobantes de pago y gestiona el código QR
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Configuración QR */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <QrCode size={20} />
              Código QR de Pago
            </h2>

            <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-300 overflow-hidden">
              {configQR.qrImageUrl ? (
                <img
                  src={configQR.qrImageUrl}
                  alt="QR de pago"
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <div className="text-center p-4">
                  <QrCode size={48} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    No hay código QR configurado
                  </p>
                </div>
              )}
            </div>

            <Link
              href="/pagos/configurar"
              className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload size={18} />
              Configurar QR
            </Link>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
              <p className="font-medium text-gray-700">Datos de la cuenta:</p>
              <p className="text-gray-600 mt-1">Banco: {configQR.banco}</p>
              <p className="text-gray-600">Titular: {configQR.titular}</p>
              <p className="text-gray-600">Nro: {configQR.nroCuenta}</p>
            </div>
          </div>
        </div>

        {/* Órdenes Pendientes de Verificación */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pendientes de Pago */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-yellow-600" />
              Pendientes de Verificación ({ordenesPendientes.length})
            </h2>

            {ordenesPendientes.length > 0 ? (
              <div className="space-y-4">
                {ordenesPendientes.map((orden) => (
                  <div
                    key={orden.id}
                    className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {orden.numeroOrden}
                        </p>
                        <p className="text-sm text-gray-500">
                          {orden.user.nombre} {orden.user.apellido}
                        </p>
                        <p className="text-xs text-gray-400">
                          {orden.user.email}
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

                    {/* Comprobante con Miniatura */}
                    {orden.comprobantePago ? (
                      <div className="bg-blue-50 p-4 rounded-lg mb-3 flex gap-4 items-center">
                        <div className="w-20 h-20 bg-white rounded border border-blue-100 overflow-hidden flex-shrink-0">
                          <img
                            src={orden.comprobantePago}
                            alt="Vista previa comprobante"
                            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => window.open(orden.comprobantePago!, '_blank')}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-blue-700 font-medium mb-1">
                            📎 Comprobante adjunto
                          </p>
                          <a
                            href={orden.comprobantePago}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                          >
                            <Eye size={14} />
                            Ver en pantalla completa
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                        <p className="text-sm text-yellow-700">
                          ⏳ Esperando comprobante del cliente
                        </p>
                      </div>
                    )}

                    {/* Items */}
                    <div className="text-sm text-gray-600 mb-3">
                      {orden.items.slice(0, 2).map((item, i) => (
                        <p key={i}>
                          • {item.cantidad}x {item.nombreProducto}
                        </p>
                      ))}
                      {orden.items.length > 2 && (
                        <p className="text-gray-400">
                          +{orden.items.length - 2} productos más
                        </p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      {orden.estado === "VERIFICANDO" && (
                        <>
                          <OrderActions ordenId={orden.id} />
                        </>
                      )}

                      <Link
                        href={`/ordenes/${orden.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye size={14} />
                        Ver Detalle
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Check size={48} className="mx-auto text-green-500 mb-2" />
                <p>No hay órdenes pendientes de verificación</p>
              </div>
            )}
          </div>

          {/* Pagos Verificados Recientes */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Check size={20} className="text-green-600" />
              Pagos Verificados Recientes
            </h2>

            {ordenesVerificadas.length > 0 ? (
              <div className="space-y-3">
                {ordenesVerificadas.map((orden) => (
                  <div
                    key={orden.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {orden.numeroOrden}
                      </p>
                      <p className="text-sm text-gray-500">
                        {orden.user.nombre} {orden.user.apellido}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${estadoColors[orden.estado]
                          }`}
                      >
                        {orden.estado}
                      </span>
                      <p className="text-sm font-medium text-gray-700 mt-1">
                        Bs. {Number(orden.total).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">
                No hay pagos verificados aún
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
