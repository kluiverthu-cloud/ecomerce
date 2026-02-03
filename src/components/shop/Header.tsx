import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';

export function Header() {
    return (
        <header className="border-b bg-white">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-gray-900">
                    TECH STORE
                </Link>

                <nav className="hidden md:flex gap-6">
                    <Link href="/productos" className="text-gray-600 hover:text-black">Productos</Link>
                    <Link href="/categorias" className="text-gray-600 hover:text-black">Categorías</Link>
                    <Link href="/ofertas" className="text-gray-600 hover:text-black">Ofertas</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/carrito" className="p-2 hover:bg-gray-100 rounded-full">
                        <ShoppingCart size={24} className="text-gray-700" />
                    </Link>
                    <Link href="/login" className="p-2 hover:bg-gray-100 rounded-full">
                        <User size={24} className="text-gray-700" />
                    </Link>
                </div>
            </div>
        </header>
    );
}
