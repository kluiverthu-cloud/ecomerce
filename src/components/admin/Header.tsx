import { Search, LayoutGrid, Bell, MoreVertical } from 'lucide-react';
import Image from 'next/image';

export function Header() {
    return (
        <header className="flex items-center justify-between px-8 py-5 bg-[#f3f4f6]">
            {/* Search Bar */}
            <div className="flex items-center w-96 bg-white rounded-xl shadow-sm overflow-hidden">
                <input
                    type="text"
                    placeholder="Search"
                    className="flex-1 px-4 py-2 text-gray-700 outline-none placeholder-gray-400"
                />
                <button className="p-3 bg-[#1e0a3c] text-white hover:bg-[#2d0f59] transition-colors">
                    <Search size={20} />
                </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6 text-gray-600">
                <button className="hover:text-[#1e0a3c] transition-colors">
                    <LayoutGrid size={24} />
                </button>
                <div className="relative">
                    <button className="hover:text-[#1e0a3c] transition-colors">
                        <Bell size={24} />
                    </button>
                    {/* Notification dot example */}
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[#f3f4f6]"></span>
                </div>
                <button className="hover:text-[#1e0a3c] transition-colors">
                    <MoreVertical size={24} />
                </button>

                {/* User Profile */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer">
                    {/* Placeholder for avatar - utilizing a colored div if image fails or generic SVg */}
                    <div className="w-full h-full bg-slate-300 flex items-center justify-center text-slate-500">
                        <span className="text-xs">User</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
