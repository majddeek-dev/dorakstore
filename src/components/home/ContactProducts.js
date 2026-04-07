"use client";
import { useState, useEffect } from "react";
import styles from "./ContactProducts.module.css";

const DEFAULT_WHATSAPP = "+970569749171";

export default function ContactProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contact-products")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load contact products", err);
        setLoading(false);
      });
  }, []);

  if (loading) return null; // or a spinner if you prefer
  if (products.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>🚀 منتجات متوفرة عند الطلب</h2>
          <p style={{ color: "#666", marginTop: "0.5rem" }}>تواصل معنا عبر الواتساب لطلب هذه العروض الخاصة</p>
        </div>
        
        <div className={styles.grid}>
          {products.map(p => {
            const phoneNumber = p.whatsappNum || DEFAULT_WHATSAPP;
            const message = encodeURIComponent(`مرحباً، لدي استفسار بخصوص هذا المنتج: ${p.name}`);
            const waLink = `https://wa.me/${phoneNumber}?text=${message}`;

            return (
              <div key={p.id} className={styles.card}>
                <div className={styles.imageWrap}>
                  <div className={styles.placeholderImage}>
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.name} className={styles.img} />
                    ) : (
                      <span className={styles.noImg}>📦</span>
                    )}
                  </div>
                </div>
                <div className={styles.info}>
                  <h3 className={styles.name}>{p.name}</h3>
                  <div className={styles.pricing}>
                    {p.price ? (
                      <span className={styles.price}>{p.price} ₪</span>
                    ) : (
                      <span className={styles.price} style={{ color: "#aaa", fontSize: "0.95rem" }}>السعر عند التواصل</span>
                    )}
                    {p.oldPrice && <span className={styles.oldPrice}>{p.oldPrice} ₪</span>}
                  </div>
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.waButton}>
                    💬 اطلب عبر الواتساب
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
