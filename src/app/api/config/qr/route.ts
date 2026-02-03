import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET /api/config/qr - Obtener configuración de QR
export async function GET() {
  try {
    // Buscar configuración existente
    const config = await prisma.configuracion.findFirst({
      where: { clave: "qr_pago" },
    });

    if (config && config.valor) {
      return NextResponse.json(JSON.parse(config.valor as string));
    }

    // Retornar valores por defecto
    return NextResponse.json({
      qrImageUrl: null,
      banco: "Tigo Money",
      titular: "Tech Store S.R.L.",
      nroCuenta: "70123456",
      instrucciones: "Escanea el código QR y envía tu comprobante",
    });
  } catch (error) {
    console.error("Error al obtener config QR:", error);
    // Retornar valores por defecto en caso de error
    return NextResponse.json({
      qrImageUrl: null,
      banco: "Tigo Money",
      titular: "Tech Store S.R.L.",
      nroCuenta: "70123456",
      instrucciones: "Escanea el código QR y envía tu comprobante",
    });
  }
}

// POST /api/config/qr - Actualizar configuración de QR (solo admin)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { qrImageUrl, banco, titular, nroCuenta, instrucciones } = body;

    const configValue = JSON.stringify({
      qrImageUrl,
      banco,
      titular,
      nroCuenta,
      instrucciones,
    });

    // Upsert configuración
    await prisma.configuracion.upsert({
      where: { clave: "qr_pago" },
      update: { valor: configValue },
      create: { clave: "qr_pago", valor: configValue },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al guardar config QR:", error);
    return NextResponse.json(
      { error: "Error al guardar configuración" },
      { status: 500 }
    );
  }
}
