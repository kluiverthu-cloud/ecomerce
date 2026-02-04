import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // 1. RUTAS PROTEGIDAS DE ADMIN
    // Si la ruta contiene "/dashboard" o alguna de las secciones de admin
    const isAdminRoute = pathname.startsWith('/dashboard') ||
        pathname.startsWith('/products') ||
        pathname.startsWith('/ordenes') ||
        pathname.startsWith('/usuarios') ||
        pathname.startsWith('/categorias');

    if (isAdminRoute) {
        if (!token) {
            // No hay token, redirigir al login
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            // Verificar el token usando jose (librería compatible con Edge Runtime de Middleware)
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const { payload } = await jose.jwtVerify(token, secret);

            // Verificar si el rol es ADMIN
            if (payload.role !== 'ADMIN') {
                // Es un cliente intentando entrar al admin, redirigir al inicio
                return NextResponse.redirect(new URL('/', request.url));
            }

            // Si todo está bien, permitir el acceso
            return NextResponse.next();
        } catch (error) {
            // Token inválido o expirado
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

// Configurar en qué rutas se debe ejecutar el middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
