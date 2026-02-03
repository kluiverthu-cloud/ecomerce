import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "productos";

    if (!file) {
      return Response.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { error: "Tipo de archivo no permitido. Use JPG, PNG, WebP o GIF" },
        { status: 400 }
      );
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json(
        { error: "El archivo es demasiado grande. Máximo 5MB" },
        { status: 400 }
      );
    }

    // Generar nombre único
    const ext = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    // Convertir a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from("images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Error al subir imagen:", error);
      return Response.json(
        { error: "Error al subir la imagen: " + error.message },
        { status: 500 }
      );
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);

    return Response.json({
      url: urlData.publicUrl,
      path: fileName,
    });
  } catch (error) {
    console.error("Error en upload:", error);
    return Response.json({ error: "Error al procesar la imagen" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return Response.json({ error: "No se proporcionó path" }, { status: 400 });
    }

    const { error } = await supabase.storage.from("images").remove([path]);

    if (error) {
      console.error("Error al eliminar imagen:", error);
      return Response.json({ error: "Error al eliminar la imagen" }, { status: 500 });
    }

    return Response.json({ message: "Imagen eliminada" });
  } catch (error) {
    console.error("Error en delete:", error);
    return Response.json({ error: "Error al eliminar la imagen" }, { status: 500 });
  }
}
