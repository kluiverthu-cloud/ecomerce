"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";

interface OrderActionsProps {
    ordenId: string;
}

export function OrderActions({ ordenId }: OrderActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (estado: "PAGADO" | "PENDIENTE") => {
        if (!confirm(estado === "PAGADO" ? "¿Aprobar este pago?" : "¿Rechazar este pago?")) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/ordenes/${ordenId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ estado }),
            });

            if (res.ok) {
                router.refresh();
            } else {
                alert("Error al actualizar la orden");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={() => handleUpdate("PAGADO")}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Aprobar Pago
            </button>
            <button
                onClick={() => handleUpdate("PENDIENTE")} // Rechazar vuelve a estado PENDIENTE (o CANCELADO si se prefiere, el código original ponía PENDIENTE)
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                Rechazar
            </button>
        </div>
    );
}
