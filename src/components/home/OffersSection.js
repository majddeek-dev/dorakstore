"use client";
import Link from "next/link";
import styles from "./OffersSection.module.css";
import { useState, useEffect } from "react";

export default function OffersSection() {
  const [offers, setOffers] = useState({ combos: [], giftOffers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/offers')
      .then(res => res.json())
      .then(data => {
        setOffers({
          combos: Array.isArray(data.combos) ? data.combos.filter(c => c.isActive) : [],
          giftOffers: Array.isArray(data.giftOffers) ? data.giftOffers.filter(g => g.isActive) : []
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalOffers = offers.combos.length + offers.giftOffers.length;
  if (loading) return null;
  if (totalOffers === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>🎁 عروض حصرية لك</h2>
          <p className={styles.subtitle}>اشتري أكثر، وفر أكثر! اكتشف باقات التوفير الخاصة بنا.</p>
        </div>

        <div className={styles.grid}>
          {offers.combos.map(combo => {
            let oldTotal = 0;
            const validItems = combo.items ? combo.items.filter(i => i.product) : [];
            validItems.forEach(i => {
              oldTotal += (i.product.price * i.quantity);
            });
            const newTotal = oldTotal - (oldTotal * combo.discountPercent / 100);

            return (
              <div key={combo.id} className={styles.card}>
                <div className={styles.badge}>وفر {combo.discountPercent}% ✨</div>
                <h3 className={styles.comboName}>{combo.name}</h3>
                {combo.description && <p className={styles.comboDesc}>{combo.description}</p>}
                
                <div className={styles.productsList}>
                  {validItems.map((item, idx) => (
                    <div key={idx} className={styles.productRow}>
                      <div className={styles.prodImg}>
                        {item.product.imageUrl ? <img src={item.product.imageUrl} alt="" /> : "📦"}
                      </div>
                      <div className={styles.prodInfo}>
                        <span className={styles.prodName}>{item.product.name}</span>
                        <span className={styles.prodQty}>الكمية: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.priceContainer}>
                  <div className={styles.oldPrice}>{oldTotal.toFixed(2)} ₪</div>
                  <div className={styles.newPrice}>{newTotal.toFixed(2)} ₪</div>
                </div>

                <Link href="/shop" className={styles.ctaBtn}>
                  تسوّق الآن
                </Link>
              </div>
            );
          })}

          {offers.giftOffers.map(go => (
            <div key={go.id} className={`${styles.card} ${styles.giftCardOffer}`}>
              <div className={`${styles.badge} ${styles.giftBadge}`}>هدية مجانية 🎁</div>
              <h3 className={styles.comboName}>
                {go.buyProduct ? `اشترِ ${go.buyProduct.name}` : `قسّم ${go.buyCategory?.name || 'منتجات مختارة'}`}
              </h3>
              <p className={styles.comboDesc}>
                {go.minPrice ? `عند الشراء بقوة ${go.minPrice} ₪ أو أكثر، ` : ""}
                احصل على هديتك الآن! ✨
              </p>
              
              <div className={styles.giftPreview}>
                 {go.getProduct ? (
                    <div className={styles.productRow}>
                       <div className={styles.prodImg}>
                          {go.getProduct.imageUrl ? <img src={go.getProduct.imageUrl} alt="" /> : "🎁"}
                       </div>
                       <div className={styles.prodInfo}>
                          <span className={styles.prodName}>{go.getProduct.name}</span>
                          <span className={styles.giftLabel}>هدية مجانية فورية</span>
                       </div>
                    </div>
                 ) : (
                    <div className={styles.categoryGift}>
                       <span style={{fontSize: "2.5rem"}}>🎁</span>
                       <p>اختر هديتك بنفسك من قسم {go.getCategory?.name}</p>
                    </div>
                 )}
              </div>

              <Link href="/shop" className={styles.ctaBtn} style={{background: "#16a34a", marginTop: "auto"}}>
                اغتنم العرض
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
