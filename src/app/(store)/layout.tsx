import CartDrawer from "@/components/cart/CartDrawer";
import StoreNotificationPopup from "@/components/common/StoreNotificationPopup";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Navbar from "@/components/layout/Navbar";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { Suspense } from "react";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <FavoritesProvider>
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <main className="flex-1 pt-20 pb-16 md:pb-0">{children}</main>
        <Footer />
        <CartDrawer />
        <StoreNotificationPopup />
        <MobileBottomNav />
      </FavoritesProvider>
    </CartProvider>
  );
}
