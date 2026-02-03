"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  Loader2,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

interface OrderItem {
  id: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto?: {
    imagenes: string[];
  };
}

interface Order {
  id: string;
  numeroOrden: string;
  estado: string;
  total: number;
  metodoPago: string;
  comprobantePago?: string;
  direccionEnvio: string;
  createdAt: string;
  items: OrderItem[];
}

const estadoConfig: Record<
  string,
  { label: string; color: string; icon: any; description: string }
> = {
  PENDIENTE: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
    description: "Esperando tu comprobante de pago",
  },
  VERIFICANDO: {
    label: "Verificando",
    color: "bg-blue-100 text-blue-700",
    icon: Clock,
    description: "Estamos verificando tu comprobante",
  },
  PAGADO: {
    label: "Pagado",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
    description: "Pago confirmado",
  },
  PROCESANDO: {
    label: "Procesando",
    color: "bg-purple-100 text-purple-700",
    icon: Package,
    description: "Preparando tu pedido",
  },
  ENVIADO: {
    label: "Enviado",
    color: "bg-indigo-100 text-indigo-700",
    icon: Truck,
    description: "Tu pedido está en camino",
  },
  ENTREGADO: {
    label: "Entregado",
    color: "bg-teal-100 text-teal-700",
    icon: CheckCircle,
    description: "Pedido entregado",
  },
  CANCELADO: {
    label: "Cancelado",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
    description: "Pedido cancelado",
  },
};

export default function MisPedidosPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/mis-pedidos");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/ordenes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || []);
      } else {
        setError("Error al cargar los pedidos");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Mis Pedidos</h1>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Aún no tienes pedidos
            </h2>
            <p className="text-gray-500 mb-6">
              Cuando realices una compra, podrás ver tus pedidos aquí
            </p>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explorar Productos
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const estado = estadoConfig[order.estado] || estadoConfig.PENDIENTE;
              const IconComponent = estado.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Header del pedido */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() =>
                      setExpandedOrder(isExpanded ? null : order.id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {order.numeroOrden}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString(
                              "es-BO",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-800">
                            Bs. {Number(order.total).toLocaleString()}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${estado.color}`}
                          >
                            <IconComponent size={12} />
                            {estado.label}
                          </span>
                        </div>
                        <Eye
                          size={20}
                          className={`text-gray-400 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Detalles expandidos */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      {/* Estado */}
                      <div className="mb-4 p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Estado:</strong> {estado.description}
                        </p>
                        {order.direccionEnvio && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Dirección:</strong> {order.direccionEnvio}
                          </p>
                        )}
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        <p className="font-medium text-gray-700 text-sm">
                          Productos ({order.items.length})
                        </p>
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 bg-white p-3 rounded-lg"
                          >
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {item.producto?.imagenes?.[0] ? (
                                <img
                                  src={item.producto.imagenes[0]}
                                  alt={item.nombreProducto}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package size={20} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {item.nombreProducto}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.cantidad} x Bs.{" "}
                                {Number(item.precioUnitario).toLocaleString()}
                              </p>
                            </div>
                            <p className="text-sm font-medium text-gray-800">
                              Bs. {Number(item.subtotal).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Comprobante */}
                      {order.comprobantePago && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <a
                            href={order.comprobantePago}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                          >
                            <Eye size={16} />
                            Ver comprobante de pago
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
