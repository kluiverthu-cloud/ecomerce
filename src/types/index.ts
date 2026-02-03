// Tipos para las respuestas de la API

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    role: "ADMIN" | "CUSTOMER";
  };
}

export interface CartSummary {
  id: string;
  userId: string;
  items: CartItemWithProduct[];
  subtotal: number;
  totalItems: number;
  updatedAt: Date;
}

export interface CartItemWithProduct {
  id: string;
  carritoId: string;
  productoId: string;
  cantidad: number;
  producto: {
    id: string;
    nombre: string;
    slug: string;
    precio: number;
    precioOferta: number | null;
    stock: number;
    imagenes: string[];
    activo: boolean;
  };
}

export interface ProductFilters {
  categoria?: string;
  marca?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  destacado?: boolean;
  orderBy?: "createdAt" | "precio" | "nombre" | "stock";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export type EstadoOrden =
  | "PENDIENTE"
  | "VERIFICANDO"
  | "PAGADO"
  | "PROCESANDO"
  | "ENVIADO"
  | "ENTREGADO"
  | "CANCELADO";

export type MetodoPago = "QR" | "TRANSFERENCIA" | "EFECTIVO";

export type Role = "ADMIN" | "CUSTOMER";
