import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { CartProvider } from "@/lib/CartContext";

export const metadata = {
  title: "أفضل المنتجات بأسعار منافسة وجودة مضمونة | Dorak Store",
  description: "اكتشف أفضل المنتجات في مكان واحد بأسعار منافسة وجودة مضمونة. تسوق الآن! Dorak Store يقدم لك كل ما تحتاجه.",
  keywords: ["متجر Dorak", "تسوق أونلاين فلسطين", "عطور عالمية", "ساعات فخمة", "إكسسوارات شبابية", "أفضل الأسعار", "جودة مضمونة", "توصيل سريع فلسطين", "عروض يومية", "كوبونات خصم", "Dorak Store", "Dorak", "DK07", "dk07store.com"],
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CartProvider>
          <Header />
          <main style={{ minHeight: "calc(100vh - 80px - 250px)" }}>
            {children}
          </main>
          <WhatsAppButton />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
