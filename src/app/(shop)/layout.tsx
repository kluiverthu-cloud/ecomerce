import { Header } from '@/components/shop/Header';
import { Footer } from '@/components/shop/Footer';

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-[#f8fbff]">
                {children}
            </main>
            <Footer />
        </div>
    );
}
