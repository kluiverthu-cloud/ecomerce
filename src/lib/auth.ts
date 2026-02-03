import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "86400"; // 24 horas por defecto

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: string;
  activo: boolean;
}

export type AuthResult =
  | { user: AuthUser }
  | { error: string; status: number };

// Hashear contraseña
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

// Verificar contraseña
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generar token JWT
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: parseInt(JWT_EXPIRES_IN),
  });
}

// Verificar token JWT
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

// Obtener token del header Authorization
export function getTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

// Middleware para verificar autenticación
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  const token = getTokenFromHeader(request);

  if (!token) {
    return { error: "Token de autenticación requerido", status: 401 };
  }

  const payload = verifyToken(token);

  if (!payload) {
    return { error: "Token inválido o expirado", status: 401 };
  }

  // Verificar que el usuario existe y está activo
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      role: true,
      activo: true,
    },
  });

  if (!user) {
    return { error: "Usuario no encontrado", status: 404 };
  }

  if (!user.activo) {
    return { error: "Usuario desactivado", status: 403 };
  }

  return { user };
}

// Middleware para verificar rol de admin
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  const auth = await authenticateRequest(request);

  if ("error" in auth) {
    return auth;
  }

  if (auth.user.role !== "ADMIN") {
    return { error: "Acceso denegado. Se requiere rol de administrador", status: 403 };
  }

  return auth;
}

// Respuesta de error estandarizada
export function authError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}
