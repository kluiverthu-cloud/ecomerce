import { Star } from 'lucide-react';
import Image from 'next/image';

interface ProductProps {
    name: string;
    price: number;
    rating: number; // 1-5
    imageOffset?: number; // Just to vary the mock visualization
}

export function DashboardProductCard({ name, price, rating, imageOffset = 0 }: ProductProps) {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300">
            <div className="w-full aspect-square bg-gray-50 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center">
                {/* Mock Image Representation */}
                <div className={`w-3/4 h-3/4 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center text-purple-200`}>
                    <span className="text-4xl">🛍️</span>
                </div>
            </div>

            <h3 className="font-semibold text-gray-700 mb-1">{name}</h3>

            <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={12}
                        fill={star <= rating ? "#f59e0b" : "none"}
                        className={star <= rating ? "text-yellow-500" : "text-gray-300"}
                    />
                ))}
            </div>

            <div className="font-bold text-gray-800 mb-3">${price.toFixed(2)}</div>

            <button className="px-6 py-2 bg-[#1e0a3c] text-white text-sm rounded-lg hover:bg-[#2d0f59] transition-colors w-full max-w-[120px]">
                Buy now
            </button>
        </div>
    );
}
