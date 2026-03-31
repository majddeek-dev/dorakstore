"use client";
import { useState, useEffect } from "react";
import ProductCard from "@/components/ui/ProductCard";
import styles from "./page.module.css";

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [pRes, cRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);
        const [pData, cData] = await Promise.all([pRes.json(), cRes.json()]);
        setProducts(Array.isArray(pData) ? pData : []);
        setCategories(Array.isArray(cData) ? cData : []);
      } catch (err) {
        console.error("Shop load error", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.categoryId === activeCategory || p.category === activeCategory);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>تسوق أحدث المنتجات</h1>
      
      <div className={styles.filters}>
        <button 
          className={`${styles.filterBtn} ${activeCategory === "all" ? styles.active : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          الكل
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id} 
            className={`${styles.filterBtn} ${activeCategory === cat.id ? styles.active : ""}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign: "center", padding: "4rem"}}>جاري تحميل المنتجات...</div>
      ) : (
        <div className={styles.grid}>
          {filteredProducts.map(p => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      )}
      
      {!loading && filteredProducts.length === 0 && (
        <div className={styles.empty}>لا توجد منتجات في هذا القسم حالياً.</div>
      )}
    </div>
  );
}
