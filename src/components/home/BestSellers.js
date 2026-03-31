"use client";
import { useState, useEffect } from "react";
import ProductCard from "@/components/ui/ProductCard";
import styles from "./BestSellers.module.css";

export default function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products/top")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load top products", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className={styles.section} style={{ textAlign: "center", padding: "4rem", color: "#666" }}>جاري تحميل الأكثر مبيعاً...</div>;
  if (products.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>الأكثر مبيعاً 🔥</h2>
        </div>
        <div className={styles.grid}>
          {products.map(p => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}
