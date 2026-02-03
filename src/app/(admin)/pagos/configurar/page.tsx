"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Save, Loader2, QrCode } from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function ConfigurarQRPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    banco: "",
    titular: "",
    nroCuenta: "",
    instrucciones: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Aquí guardarías la configuración en la base de datos
    // Por ahora solo simulamos el guardado
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLoading(false);
    router.push("/pagos");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/pagos"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Configurar Código QR
          </h1>
          <p className="text-gray-500">
            Sube tu código QR para recibir pagos
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Imagen QR */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <QrCode size={20} />
            Imagen del Código QR
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Sube una imagen clara de tu código QR de pago (Tigo Money, banco,
            etc.)
          </p>
          <ImageUpload
            images={qrImage}
            onChange={setQrImage}
            maxImages={1}
            folder="qr"
          />
        </div>

        {/* Datos de la cuenta */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">
            Datos de la Cuenta
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Esta información se mostrará a los clientes al momento de pagar
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banco / Servicio
              </label>
              <input
                type="text"
                name="banco"
                value={formData.banco}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Tigo Money, BNB, Banco Unión"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Titular
              </label>
              <input
                type="text"
                name="titular"
                value={formData.titular}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Tech Store S.R.L."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Cuenta / Celular
              </label>
              <input
                type="text"
                name="nroCuenta"
                value={formData.nroCuenta}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 70123456 o 1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instrucciones Adicionales
              </label>
              <textarea
                name="instrucciones"
                value={formData.instrucciones}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Enviar captura de comprobante por WhatsApp al 70123456"
              />
            </div>
          </div>
        </div>

        {/* Vista Previa */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
          <h3 className="font-semibold text-gray-800 mb-3">
            Vista previa para el cliente
          </h3>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex gap-4">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                {qrImage.length > 0 ? (
                  <img
                    src={qrImage[0]}
                    alt="QR"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCode size={40} className="text-gray-400" />
                )}
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-800">
                  {formData.banco || "Banco / Servicio"}
                </p>
                <p className="text-gray-600">
                  Titular: {formData.titular || "Nombre del titular"}
                </p>
                <p className="text-gray-600">
                  Cuenta: {formData.nroCuenta || "Número de cuenta"}
                </p>
                {formData.instrucciones && (
                  <p className="text-gray-500 mt-2 text-xs">
                    {formData.instrucciones}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 justify-end">
          <Link
            href="/pagos"
            className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} />
                Guardar Configuración
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
