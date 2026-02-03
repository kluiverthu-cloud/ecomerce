import { DashboardProductCard } from '@/components/admin/DashboardProductCard';
import { ChevronRight } from 'lucide-react';

export default function DashboardPage() {
    const products = [
        { name: "Gift Watch", price: 5470.00, rating: 5 },
        { name: "Gift Shoe", price: 5470.00, rating: 5 },
        { name: "Gift Bag", price: 5470.00, rating: 5 },
        { name: "Gift Girls Watch", price: 5470.00, rating: 4 },
    ];

    return (
        <div className="space-y-8">
            {/* Products Section */}
            <section>
                <h2 className="text-xl font-bold text-gray-700 mb-6">Product</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((p, i) => (
                        <DashboardProductCard key={i} {...p} />
                    ))}
                </div>
            </section>

            {/* Pagination Mock */}
            <div className="flex justify-center gap-2 my-4">
                {[1, 2, 3, 4].map((num) => (
                    <button
                        key={num}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${num === 4
                                ? 'bg-[#1e0a3c] text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        {num}
                    </button>
                ))}
                <button className="h-8 px-3 rounded-lg bg-[#1e0a3c] text-white text-sm flex items-center gap-1 hover:bg-[#2d0f59]">
                    Next <ChevronRight size={14} />
                </button>
            </div>

            {/* Best Product Section */}
            <section>
                <h2 className="text-xl font-bold text-gray-700 mb-6">Best Product</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((p, i) => (
                        <DashboardProductCard key={`best-${i}`} {...p} />
                    ))}
                </div>
            </section>

            {/* Pagination Mock 2 */}
            <div className="flex justify-center gap-2 my-4">
                {[1, 2, 3, 4].map((num) => (
                    <button
                        key={num}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${num === 4
                                ? 'bg-[#1e0a3c] text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        {num}
                    </button>
                ))}
                <button className="h-8 px-3 rounded-lg bg-[#1e0a3c] text-white text-sm flex items-center gap-1 hover:bg-[#2d0f59]">
                    Next <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}
