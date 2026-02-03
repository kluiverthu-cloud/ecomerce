import {
    Users,
    DollarSign,
    ShoppingBag,
    TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Sales', value: '$12,450', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
                    { label: 'Total Orders', value: '345', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { label: 'New Customers', value: '1,234', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
                    { label: 'Growth', value: '+12.5%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                            <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                                    IMG
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">New Order #123{i}4</p>
                                    <p className="text-sm text-gray-500">2 minutes ago</p>
                                </div>
                            </div>
                            <span className="text-green-600 font-medium">+$120.00</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
