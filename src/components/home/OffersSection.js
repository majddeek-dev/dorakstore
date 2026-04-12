"use client";
import Link from "next/link";
import styles from "./OffersSection.module.css";
import { useState, useEffect } from "react";

export default function OffersSection() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/combos') // Can reuse this API or make a public one, assuming admin/combos returns all for now. Ideally make a public one /api/combos.
      .then(res => res.json())
      .then(data => {
        // filter out inactive combos
        const activeCombos = (Array.isArray(data) ? data : []).filter(c => c.isActive);
        setCombos(activeCombos);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null; // Or a skeleton
  if (combos.length === 0) return null; // don't show section if no offers

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>🎁 عروض حصرية لك</h2>
          <p className={styles.subtitle}>اشتري أكثر، وفر أكثر! اكتشف باقات التوفير الخاصة بنا.</p>
        </div>

        <div className={styles.grid}>
          {combos.map(combo => {
            // calculate old vs new price if we want, currently combos just show discount % and items.
            // to do it right we need product details, which the API includes (c.items.map(i => i.product))
            let oldTotal = 0;
            const validItems = combo.items ? combo.items.filter(i => i.product) : [];
            validItems.forEach(i => {
              oldTotal += (i.product.price * i.quantity);
            });
            const newTotal = oldTotal - (oldTotal * combo.discountPercent / 100);

            return (
              <div key={combo.id} className={styles.card}>
                <div className={styles.badge}>خصم {combo.discountPercent}%</div>
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

                <button className={styles.ctaBtn} onClick={() => alert("سيتم إضافة العرض للسلة مستقبلاً")}>
                  أضف العرض للسلة
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
