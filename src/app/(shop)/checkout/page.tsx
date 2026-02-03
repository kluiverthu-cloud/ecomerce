"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  QrCode,
  Upload,
  Check,
  Loader2,
  ShoppingBag,
  MapPin,
  Phone,
  User,
  X,
  Image as ImageIcon,
} from "lucide-react";

interface ConfigQR {
  qrImageUrl: string | null;
  banco: string;
  titular: string;
  nroCuenta: string;
  instrucciones?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart, itemCount } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [step, setStep] = useState<"datos" | "pago" | "confirmacion">("datos");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ordenId, setOrdenId] = useState<string | null>(null);
  const [numeroOrden, setNumeroOrden] = useState<string>("");

  const [configQR, setConfigQR] = useState<ConfigQR>({
    qrImageUrl: null,
    banco: "Tigo Money",
    titular: "Tech Store S.R.L.",
    nroCuenta: "70123456",
    instrucciones: "Escanea el código QR o transfiere al número indicado",
  });

  const [datosEnvio, setDatosEnvio] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    referencia: "",
  });

  const [comprobante, setComprobante] = useState<File | null>(null);
  const [comprobantePreview, setComprobantePreview] = useState<string | null>(null);
  const [uploadingComprobante, setUploadingComprobante] = useState(false);

  // Cargar datos del usuario si está autenticado
  useEffect(() => {
    if (user) {
      setDatosEnvio((prev) => ({
        ...prev,
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        telefono: user.telefono || "",
      }));
    }
  }, [user]);

  // Cargar config QR
  useEffect(() => {
    fetch("/api/config/qr")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setConfigQR(data);
        }
      })
      .catch(console.error);
  }, []);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/checkout");
    }
  }, [isLoading, isAuthenticated, router]);

  // Redirigir si el carrito está vacío (excepto en confirmación)
  useEffect(() => {
    if (!isLoading && items.length === 0 && step !== "confirmacion") {
      router.push("/carrito");
    }
  }, [items.length, isLoading, router, step]);

  const handleDatosChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDatosEnvio((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleComprobanteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("El archivo debe ser menor a 5MB");
        return;
      }
      setComprobante(file);
      setComprobantePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const removeComprobante = () => {
    setComprobante(null);
    if (comprobantePreview) {
      URL.revokeObjectURL(comprobantePreview);
      setComprobantePreview(null);
    }
  };

  const handleContinuarAPago = () => {
    // Validar datos
    if (
      !datosEnvio.nombre ||
      !datosEnvio.apellido ||
      !datosEnvio.telefono ||
      !datosEnvio.direccion ||
      !datosEnvio.ciudad
    ) {
      setError("Por favor completa todos los campos requeridos");
      return;
    }
    setStep("pago");
  };

  const handleCrearOrden = async () => {
    if (!comprobante) {
      setError("Por favor sube tu comprobante de pago");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Subir comprobante
      setUploadingComprobante(true);
      const formData = new FormData();
      formData.append("file", comprobante);
      formData.append("folder", "comprobantes");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Error al subir el comprobante");
      }

      const { url: comprobanteUrl } = await uploadRes.json();
      setUploadingComprobante(false);

      // 2. Crear la orden
      const token = localStorage.getItem("token");
      const orderRes = await fetch("/api/ordenes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productoId: item.id,
            cantidad: item.cantidad,
            precio: item.precioOferta ?? item.precio,
            nombreProducto: item.nombre,
          })),
          datosEnvio,
          comprobantePago: comprobanteUrl,
          metodoPago: "QR",
          subtotal: total,
          total: total,
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json();
        throw new Error(data.error || "Error al crear la orden");
      }

      const orderData = await orderRes.json();
      setOrdenId(orderData.orden.id);
      setNumeroOrden(orderData.orden.numeroOrden);

      // 3. Limpiar carrito y mostrar confirmación
      clearCart();
      setStep("confirmacion");
    } catch (err: any) {
      setError(err.message || "Error al procesar el pedido");
    } finally {
      setLoading(false);
      setUploadingComprobante(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Paso de confirmación
  if (step === "confirmacion") {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Pedido Recibido!
          </h1>
          <p className="text-gray-500 mb-6">
            Tu orden <span className="font-semibold">{numeroOrden}</span> ha sido
            recibida y está pendiente de verificación de pago.
          </p>

          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-blue-700">
              <strong>¿Qué sigue?</strong>
              <br />
              Verificaremos tu comprobante de pago. Una vez confirmado,
              procesaremos tu pedido y te notificaremos por email.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/mis-pedidos"
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Ver Mis Pedidos
            </Link>
            <Link
              href="/productos"
              className="w-full py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Seguir Comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => (step === "pago" ? setStep("datos") : router.back())}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
            <p className="text-gray-500">
              Paso {step === "datos" ? "1" : "2"} de 2:{" "}
              {step === "datos" ? "Datos de envío" : "Pago"}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          <div
            className={`flex-1 h-2 rounded-full ${step === "datos" ? "bg-blue-600" : "bg-blue-600"
              }`}
          />
          <div
            className={`flex-1 h-2 rounded-full ${step === "pago" ? "bg-blue-600" : "bg-gray-200"
              }`}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario Principal */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Paso 1: Datos de Envío */}
            {step === "datos" && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Datos de Envío
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={datosEnvio.nombre}
                      onChange={handleDatosChange}
                      className="w-full px-4 py-2 border border-blue-100 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      value={datosEnvio.apellido}
                      onChange={handleDatosChange}
                      className="w-full px-4 py-2 border border-blue-100 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-sm"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      name="telefono"
                      value={datosEnvio.telefono}
                      onChange={handleDatosChange}
                      className="w-full pl-10 pr-4 py-2 border border-blue-100 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-sm"
                      placeholder="70123456"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={datosEnvio.ciudad}
                    onChange={handleDatosChange}
                    className="w-full px-4 py-2 border border-blue-100 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-sm"
                    placeholder="La Paz, Cochabamba, Santa Cruz..."
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección de Entrega *
                  </label>
                  <textarea
                    name="direccion"
                    value={datosEnvio.direccion}
                    onChange={handleDatosChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-blue-100 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-sm"
                    placeholder="Calle, número, zona, edificio..."
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referencia (opcional)
                  </label>
                  <input
                    type="text"
                    name="referencia"
                    value={datosEnvio.referencia}
                    onChange={handleDatosChange}
                    className="w-full px-4 py-2 border border-blue-100 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-sm"
                    placeholder="Cerca de..., frente a..."
                  />
                </div>

                <button
                  onClick={handleContinuarAPago}
                  className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Continuar al Pago
                </button>
              </div>
            )}

            {/* Paso 2: Pago */}
            {step === "pago" && (
              <div className="space-y-6">
                {/* QR de Pago */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <QrCode size={20} />
                    Pago con QR
                  </h2>

                  <div className="flex flex-col md:flex-row gap-6">
                    {/* QR Image */}
                    <div className="w-full md:w-48 flex-shrink-0">
                      <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                        {configQR.qrImageUrl ? (
                          <img
                            src={configQR.qrImageUrl}
                            alt="QR de pago"
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <QrCode size={48} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500">QR no disponible</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Datos de la cuenta */}
                    <div className="flex-1">
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <p className="font-semibold text-blue-800 mb-2">
                          {configQR.banco}
                        </p>
                        <p className="text-sm text-blue-700">
                          <strong>Titular:</strong> {configQR.titular}
                        </p>
                        <p className="text-sm text-blue-700">
                          <strong>Número:</strong> {configQR.nroCuenta}
                        </p>
                      </div>

                      <div className="bg-yellow-50 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Monto a pagar:</strong>{" "}
                          <span className="text-lg font-bold">
                            Bs. {total.toLocaleString()}
                          </span>
                        </p>
                        {configQR.instrucciones && (
                          <p className="text-sm text-yellow-700 mt-2">
                            {configQR.instrucciones}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subir Comprobante */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Upload size={20} />
                    Subir Comprobante de Pago *
                  </h2>

                  <p className="text-sm text-gray-500 mb-4">
                    Sube una captura o foto de tu comprobante de transferencia
                  </p>

                  {comprobantePreview ? (
                    <div className="relative">
                      <img
                        src={comprobantePreview}
                        alt="Comprobante"
                        className="max-h-64 rounded-lg border border-gray-200 mx-auto"
                      />
                      <button
                        onClick={removeComprobante}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                      <p className="text-center text-sm text-green-600 mt-2 flex items-center justify-center gap-1">
                        <Check size={16} />
                        Comprobante cargado
                      </p>
                    </div>
                  ) : (
                    <label className="block">
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <ImageIcon
                          size={40}
                          className="mx-auto text-gray-400 mb-3"
                        />
                        <p className="text-gray-600 font-medium">
                          Haz clic para subir tu comprobante
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          JPG, PNG o PDF (máx. 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleComprobanteChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Botón de confirmar */}
                <button
                  onClick={handleCrearOrden}
                  disabled={loading || !comprobante}
                  className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {uploadingComprobante
                        ? "Subiendo comprobante..."
                        : "Procesando..."}
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      Confirmar Pedido
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBag size={20} />
                Resumen ({itemCount} {itemCount === 1 ? "producto" : "productos"})
              </h2>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imagen ? (
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {item.nombre}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.cantidad} x Bs.{" "}
                        {(item.precioOferta ?? item.precio).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-800">
                      Bs.{" "}
                      {(
                        (item.precioOferta ?? item.precio) * item.cantidad
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>Bs. {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío</span>
                  <span className="text-green-600">Gratis</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-blue-600">Bs. {total.toLocaleString()}</span>
                </div>
              </div>

              {step === "pago" && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    <strong>Envío a:</strong>
                    <br />
                    {datosEnvio.nombre} {datosEnvio.apellido}
                    <br />
                    {datosEnvio.direccion}, {datosEnvio.ciudad}
                    <br />
                    Tel: {datosEnvio.telefono}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
