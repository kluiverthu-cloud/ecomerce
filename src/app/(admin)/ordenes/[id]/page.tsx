import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Package, User, MapPin, Phone, CreditCard, Calendar, Clock, ShoppingBag } from "lucide-react";
import { notFound } from "next/navigation";

interface Props {
    params: Promise<{ id: string }>;
}

async function getOrden(id: string) {
    const orden = await prisma.orden.findFirst({
        where: {
            OR: [{ id }, { numeroOrden: id }],
        },
        include: {
            user: {
                select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    email: true,
                    telefono: true,
                },
            },
            items: {
                include: {
                    producto: {
                        select: {
                            id: true,
                            nombre: true,
                            slug: true,
                            imagenes: true,
                            sku: true,
                        },
                    },
                },
            },
        },
    });

    if (!orden) return null;
    return orden;
}

export default async function DetalleOrdenPage({ params }: Props) {
    const { id } = await params;
    const orden = await getOrden(id);

    if (!orden) {
        notFound();
    }

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
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/ordenes" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        Orden #{orden.numeroOrden}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoColors[orden.estado]}`}>
                            {orden.estado}
                        </span>
                    </h1>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(orden.createdAt).toLocaleDateString("es-BO", {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(orden.createdAt).toLocaleTimeString("es-BO", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda - Detalles de Orden y Productos */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Productos */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                <ShoppingBag size={18} />
                                Productos ({orden.items.length})
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {orden.items.map((item) => (
                                <div key={item.id} className="p-4 flex gap-4 items-center hover:bg-gray-50">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                        {item.producto.imagenes.length > 0 ? (
                                            <img
                                                src={item.producto.imagenes[0]}
                                                alt={item.nombreProducto}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Package size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{item.nombreProducto}</p>
                                        <p className="text-sm text-gray-500">SKU: {item.producto.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">
                                            {item.cantidad} x Bs. {Number(item.precioUnitario).toLocaleString()}
                                        </p>
                                        <p className="font-bold text-gray-800">
                                            Bs. {Number(item.subtotal).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">Bs. {Number(orden.subtotal).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Envío</span>
                                <span className="font-medium">Bs. {Number(orden.envio).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                                <span className="text-gray-900">Total</span>
                                <span className="text-blue-600">Bs. {Number(orden.total).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha - Info Cliente y Envío */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Cliente */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <User size={18} />
                            Datos del Cliente
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {orden.user.nombre.charAt(0)}{orden.user.apellido.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{orden.user.nombre} {orden.user.apellido}</p>
                                    <p className="text-gray-500">{orden.user.email}</p>
                                </div>
                            </div>
                            {orden.user.telefono && (
                                <div className="flex items-center gap-2 text-gray-600 pt-2">
                                    <Phone size={16} />
                                    <span>{orden.user.telefono}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dirección de Envío */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <MapPin size={18} />
                            Dirección de Envío
                        </h2>
                        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <p className="whitespace-pre-line leading-relaxed">{orden.direccionEnvio}</p>
                        </div>
                        {orden.telefonoContacto && (
                            <div className="mt-4 flex items-center gap-2 text-gray-600 text-sm">
                                <Phone size={16} />
                                <span className="font-medium">Contacto:</span> {orden.telefonoContacto}
                            </div>
                        )}
                        {orden.notas && (
                            <div className="mt-4">
                                <p className="text-xs font-medium text-gray-500 mb-1">Notas del cliente:</p>
                                <div className="text-sm text-gray-600 italic bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                    "{orden.notas}"
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Método de Pago */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <CreditCard size={18} />
                            Pago
                        </h2>
                        <div className="flex items-center gap-2 text-gray-700">
                            <span className="font-medium">Método:</span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold">{orden.metodoPago}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
