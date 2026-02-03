export default function ShopHome() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white mb-12">
                <h1 className="text-5xl font-bold mb-4">Bienvenido a Tech Store</h1>
                <p className="text-xl opacity-90 mb-8">La mejor tecnología al mejor precio.</p>
                <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors">
                    Ver Productos
                </button>
            </section>

            {/* Categories Grid Placeholder */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Categorías Populares</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Laptops', 'PC Gamer', 'Componentes', 'Periféricos'].map((cat) => (
                        <div key={cat} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 text-center">
                            <h3 className="font-semibold">{cat}</h3>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Products Placeholder */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Destacados</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm h-64 flex items-center justify-center text-gray-400 border border-gray-100">
                        Producto 1
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm h-64 flex items-center justify-center text-gray-400 border border-gray-100">
                        Producto 2
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm h-64 flex items-center justify-center text-gray-400 border border-gray-100">
                        Producto 3
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm h-64 flex items-center justify-center text-gray-400 border border-gray-100">
                        Producto 4
                    </div>
                </div>
            </section>
        </div>
    );
}
