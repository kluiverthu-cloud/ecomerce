"use client";

import { useState, useCallback } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  folder?: string;
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 5,
  folder = "productos",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      if (images.length + files.length > maxImages) {
        setError(`Máximo ${maxImages} imágenes permitidas`);
        return;
      }

      setUploading(true);
      setError(null);

      const newImages: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (!res.ok) {
            setError(data.error || "Error al subir imagen");
            continue;
          }

          newImages.push(data.url);
        } catch (err) {
          setError("Error de conexión al subir imagen");
        }
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }

      setUploading(false);
    },
    [images, onChange, maxImages, folder]
  );

  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);
    },
    [images, onChange]
  );

  return (
    <div className="space-y-4">
      {/* Imágenes existentes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
            >
              <img
                src={img}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X size={16} />
              </button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Área de subida */}
      {images.length < maxImages && (
        <label
          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            uploading
              ? "border-blue-300 bg-blue-50"
              : "border-gray-300 hover:border-blue-500 hover:bg-gray-50"
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <>
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
                <p className="text-sm text-blue-600">Subiendo imagen...</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-blue-600">
                    Haz clic para subir
                  </span>{" "}
                  o arrastra y suelta
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WebP o GIF (máx. 5MB)
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {images.length} de {maxImages} imágenes
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files)}
          />
        </label>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}
