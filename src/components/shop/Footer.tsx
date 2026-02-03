export function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-xl font-black mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">TECH STORE</h3>
                    <p className="text-gray-400">Tu tienda de tecnología de confianza.</p>
                </div>

                <div>
                    <h4 className="font-semibold mb-3">Soporte</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li>Contacto</li>
                        <li>Envíos</li>
                        <li>Devoluciones</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-3">Síguenos</h4>
                    <div className="flex gap-4">
                        {/* Social icons would go here */}
                        <span>Facebook</span>
                        <span>Instagram</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
