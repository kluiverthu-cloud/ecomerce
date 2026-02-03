"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/ui/ImageUpload";

interface Spec {
    nombre: string;
    valor: string;
}

interface Categoria {
    id: string;
    nombre: string;
}

interface Marca {
    id: string;
    nombre: string;
}

interface Props {
    params: Promise<{ id: string }>;
}

export default function EditarProductoPage({ params }: Props) {
    const router = useRouter();
    const { id } = use(params);
    const [loading, setLoading] = useState(false);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [marcas, setMarcas] = useState<Marca[]>([]);

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        precioOferta: "",
        stock: "",
        categoriaId: "",
        marcaId: "",
        destacado: false,
        activo: true,
    });

    const [imagenes, setImagenes] = useState<string[]>([]);
    const [specs, setSpecs] = useState<Spec[]>([]);

    // Cargar datos del producto y configuración
    useEffect(() => {
        async function loadData() {
            try {
                const [prodRes, catRes, marcaRes] = await Promise.all([
                    fetch(`/api/productos/${id}`),
                    fetch("/api/categorias"),
                    fetch("/api/marcas"),
                ]);

                const prodData = await prodRes.json();
                const catData = await catRes.json();
                const marcaData = await marcaRes.json();

                if (prodRes.ok) {
                    setFormData({
                        nombre: prodData.nombre,
                        descripcion: prodData.descripcion,
                        precio: prodData.precio,
                        precioOferta: prodData.precioOferta || "",
                        stock: prodData.stock,
                        categoriaId: prodData.categoriaId,
                        marcaId: prodData.marcaId,
                        destacado: prodData.destacado,
                        activo: prodData.activo,
                    });
                    setImagenes(prodData.imagenes || []);
                    setSpecs(prodData.specs || []);
                } else {
                    setError(prodData.error || "Error al cargar producto");
                }

                setCategorias(catData);
                setMarcas(marcaData);
            } catch (err) {
                console.error("Error al cargar datos:", err);
                setError("Error de conexión");
            } finally {
                setLoadingConfig(false);
            }
        }
        loadData();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const addSpec = () => {
        setSpecs([...specs, { nombre: "", valor: "" }]);
    };

    const updateSpec = (index: number, field: "nombre" | "valor", value: string) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = value;
        setSpecs(newSpecs);
    };

    const removeSpec = (index: number) => {
        setSpecs(specs.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                precio: parseFloat(formData.precio),
                precioOferta: formData.precioOferta
                    ? parseFloat(formData.precioOferta)
                    : null,
                stock: parseInt(formData.stock) || 0,
                categoriaId: formData.categoriaId,
                marcaId: formData.marcaId,
                imagenes,
                destacado: formData.destacado,
                activo: formData.activo,
                specs: specs.filter((s) => s.nombre && s.valor),
            };

            const token = localStorage.getItem("token");
            const res = await fetch(`/api/productos/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al actualizar producto");
            }

            router.push("/products");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loadingConfig) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/products"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Editar Producto</h1>
                    <p className="text-gray-500">Modifica los datos del producto</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información básica */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-800 mb-4">
                        Información Básica
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre del Producto *
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                placeholder="Ej: Laptop Gaming ASUS ROG"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción *
                            </label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full px-4 py-2 border border-blue-100 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-sm"
                                placeholder="Describe el producto..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Categoría *
                            </label>
                            <select
                                name="categoriaId"
                                value={formData.categoriaId}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-blue-100 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-sm"
                            >
                                <option value="">Seleccionar categoría</option>
                                {categorias.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Marca *
                            </label>
                            <select
                                name="marcaId"
                                value={formData.marcaId}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-blue-100 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-sm"
                            >
                                <option value="">Seleccionar marca</option>
                                {marcas.map((marca) => (
                                    <option key={marca.id} value={marca.id}>
                                        {marca.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Precios y Stock */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-800 mb-4">Precios y Stock</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Precio (Bs.) *
                            </label>
                            <input
                                type="number"
                                name="precio"
                                value={formData.precio}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-blue-100 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-sm"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Precio Oferta (Bs.)
                            </label>
                            <input
                                type="number"
                                name="precioOferta"
                                value={formData.precioOferta}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-blue-100 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-sm"
                                placeholder="Opcional"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock *
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full px-4 py-2 border border-blue-100 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-sm"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="destacado"
                                checked={formData.destacado}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                Producto destacado
                            </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="activo"
                                checked={formData.activo}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                Visible (Activo)
                            </span>
                        </label>
                    </div>
                </div>

                {/* Imágenes */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-800 mb-4">
                        Imágenes del Producto
                    </h2>
                    <ImageUpload
                        images={imagenes}
                        onChange={setImagenes}
                        maxImages={5}
                        folder="productos"
                    />
                </div>

                {/* Especificaciones */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold text-gray-800">Especificaciones</h2>
                        <button
                            type="button"
                            onClick={addSpec}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                            <Plus size={16} />
                            Agregar
                        </button>
                    </div>

                    {specs.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            No hay especificaciones. Agrega características como RAM,
                            procesador, pantalla, etc.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {specs.map((spec, index) => (
                                <div key={index} className="flex gap-3 items-start">
                                    <input
                                        type="text"
                                        value={spec.nombre}
                                        onChange={(e) => updateSpec(index, "nombre", e.target.value)}
                                        placeholder="Ej: RAM"
                                        className="flex-1 px-3 py-2 border border-blue-100 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-sm"
                                    />
                                    <input
                                        type="text"
                                        value={spec.valor}
                                        onChange={(e) => updateSpec(index, "valor", e.target.value)}
                                        placeholder="Ej: 16GB DDR4"
                                        className="flex-1 px-3 py-2 border border-blue-100 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeSpec(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Botones */}
                <div className="flex gap-4 justify-end">
                    <Link
                        href="/products"
                        className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Guardar Cambios
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
