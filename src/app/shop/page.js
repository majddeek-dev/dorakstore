"use client";
import { useState, useEffect } from "react";
import ProductCard from "@/components/ui/ProductCard";
import styles from "./page.module.css";

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch categories once
  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(data => {
      if(Array.isArray(data)) setCategories(data);
    });
  }, []);

  // Fetch products when category or page changes
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const urlOpts = new URLSearchParams();
        if (activeCategory !== 'all') urlOpts.append('category', activeCategory);
        urlOpts.append('page', currentPage);
        urlOpts.append('limit', 10);
        
        const res = await fetch(`/api/products?${urlOpts.toString()}`);
        const data = await res.json();
        
        if (data.products) {
          setProducts(data.products);
          setTotalPages(data.totalPages);
        } else if (Array.isArray(data)) {
          setProducts(data);
          setTotalPages(1);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Shop load error", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [activeCategory, currentPage]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setCurrentPage(1); // Reset to first page when changing category
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>تسوق أحدث المنتجات</h1>
      
      <div className={styles.filters}>
        <button 
          className={`${styles.filterBtn} ${activeCategory === "all" ? styles.active : ""}`}
          onClick={() => handleCategoryChange("all")}
        >
          الكل
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id} 
            className={`${styles.filterBtn} ${activeCategory === cat.id ? styles.active : ""}`}
            onClick={() => handleCategoryChange(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign: "center", padding: "4rem"}}>جاري تحميل المنتجات...</div>
      ) : (
        <div className={styles.grid}>
          {products.map(p => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      )}
      
      {!loading && products.length === 0 && (
        <div className={styles.empty}>لا توجد منتجات في هذا القسم حالياً.</div>
      )}

      {!loading && totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
            className={styles.pageBtn}
          >
            السابق
          </button>
          
          <span className={styles.pageInfo}>
            صفحة {currentPage} من {totalPages}
          </span>
          
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => prev + 1)}
            className={styles.pageBtn}
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}
