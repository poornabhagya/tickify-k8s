import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors">
            <Header />

            {/* Thẻ <main> này sẽ tự động co giãn nhờ flex-1. 
        Mọi trang nội dung (như trang chủ, trang đặt vé) sẽ được "bơm" vào vị trí của <Outlet />
      */}
            <main className="flex-1 w-full bg-background text-foreground transition-colors">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}