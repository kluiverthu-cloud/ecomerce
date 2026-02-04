"use client";

import { useState } from "react";

interface ProductGalleryProps {
    imagenes: string[];
    nombre: string;
}

export function ProductGallery({ imagenes, nombre }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    if (imagenes.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="h-96 flex items-center justify-center bg-gray-50">
                    <span className="text-gray-300 text-8xl">📦</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-[500px] flex items-center justify-center p-4">
                <img
                    src={imagenes[selectedImage]}
                    alt={nombre}
                    className="max-h-full max-w-full object-contain transition-all duration-300"
                />
            </div>

            {imagenes.length > 1 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                    {imagenes.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedImage(i)}
                            className={`h-24 bg-white rounded-xl border-2 overflow-hidden transition-all duration-200 ${selectedImage === i
                                    ? "border-blue-600 ring-2 ring-blue-100"
                                    : "border-gray-100 hover:border-blue-300"
                                }`}
                        >
                            <img
                                src={img}
                                alt={`${nombre} ${i + 1}`}
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
