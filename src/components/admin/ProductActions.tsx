"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Edit, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
    product: {
        id: string;
        slug: string;
        activo: boolean;
        nombre: string;
    };
}

export function ProductActions({ product }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleToggleActive = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/productos/${product.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ activo: !product.activo }),
            });
            if (res.ok) {
                router.refresh();
            } else {
                alert("Error al actualizar estado");
            }
        } catch (e) {
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`¿Estás seguro de eliminar "${product.nombre}"? Esta acción no se puede deshacer.`)) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/productos/${product.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || "Error al eliminar");
            }
        } catch (e) {
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-end gap-2">
            <button
                onClick={handleToggleActive}
                disabled={loading}
                className={`p-2 rounded-lg transition-colors ${product.activo
                        ? "text-green-600 hover:bg-green-50"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                title={product.activo ? "Visible (Click para ocultar)" : "Oculto (Click para mostrar)"}
            >
                {product.activo ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>

            <Link
                href={`/products/${product.id}/editar`}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar"
            >
                <Edit size={18} />
            </Link>

            <button
                onClick={handleDelete}
                disabled={loading}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar"
            >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
        </div>
    );
}
