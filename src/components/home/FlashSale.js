"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./FlashSale.module.css";
import ProductCard from "@/components/ui/ProductCard";

export default function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({ h: 12, m: 0, s: 0 });
  const [flashProduct, setFlashProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Timer Logic: Until end of today
    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0 });
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft({ h, m, s });
      }
    }, 1000);

    // Fetch dynamic settings and products
    async function loadFlashSale() {
      try {
        const [settingsRes, productsRes] = await Promise.all([
          fetch('/api/admin/settings'),
          fetch('/api/products')
        ]);
        const settings = await settingsRes.json();
        const products = await productsRes.json();

        if (settings.flash_sale_enabled === "false") {
          setFlashProduct(null);
          setLoading(false);
          return;
        }

        if (Array.isArray(products)) {
          let offer;
          if (settings.flash_sale_product_id) {
            offer = products.find(p => p.id === settings.flash_sale_product_id);
          }
          
          // Fallback if ID is invalid or not set
          if (!offer) {
            offer = products.find(p => p.badge?.includes('%') || p.price < p.oldPrice) || products[0];
          }
          
          setFlashProduct(offer);
        }
      } catch (err) {
        console.error("Flash sale load failed", err);
      } finally {
        setLoading(false);
      }
    }

    loadFlashSale();
    return () => clearInterval(timer);
  }, []);

  if (loading || !flashProduct) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.badge}>عرض اليوم المحدود 🔥</div>
          <h2 className={styles.title}>تخفيضات كبرى لفترة محدودة</h2>
          <p className={styles.desc}>احصل على أفضل المنتجات بأسعار لا تقبل المنافسة قبل انتهاء الوقت المتبقي.</p>
          
          <div className={styles.timer}>
            <div className={styles.timeBox}>
              <span className={styles.timeNum}>{String(timeLeft.h).padStart(2, '0')}</span>
              <span className={styles.timeLabel}>ساعة</span>
            </div>
            <span className={styles.separator}>:</span>
            <div className={styles.timeBox}>
              <span className={styles.timeNum}>{String(timeLeft.m).padStart(2, '0')}</span>
              <span className={styles.timeLabel}>دقيقة</span>
            </div>
            <span className={styles.separator}>:</span>
            <div className={styles.timeBox}>
              <span className={styles.timeNum}>{String(timeLeft.s).padStart(2, '0')}</span>
              <span className={styles.timeLabel}>ثانية</span>
            </div>
          </div>
          
          <Link href="/shop" className={styles.btn}>تسوّق الآن ✨</Link>
        </div>
        
        <div className={styles.productWrap}>
          <ProductCard {...flashProduct} />
        </div>
      </div>
    </section>
  );
}
