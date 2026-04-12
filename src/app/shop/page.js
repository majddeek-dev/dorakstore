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

  // New Filters
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState(""); // default (sortOrder) or 'low', 'high', 'new'

  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setCategories(data);
    });
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const urlOpts = new URLSearchParams();
        if (activeCategory !== 'all') urlOpts.append('category', activeCategory);
        urlOpts.append('page', currentPage);
        urlOpts.append('limit', 20);

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
    setCurrentPage(1);
  }

  // Client-side filtering & sorting for search & sort
  let displayedProducts = [...products];
  if (search) {
    displayedProducts = displayedProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }
  
  if (sortOrder === 'low') {
    displayedProducts.sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'high') {
    displayedProducts.sort((a, b) => b.price - a.price);
  } else if (sortOrder === 'new') {
    displayedProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } else {
    // Default: Sort by the custom sortOrder defined by admin
    displayedProducts.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>تسوق أحدث المنتجات</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem", justifyContent: "space-between" }}>
        <div className={styles.filters} style={{ margin: 0, flex: 2 }}>
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
        
        <div style={{ display: "flex", gap: "0.5rem", flex: 1, minWidth: "300px" }}>
          <input 
            type="text" 
            placeholder="ابحث عن منتج..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 2, padding: "0.6rem 1rem", border: "1px solid #e5e7eb", borderRadius: "8px", fontFamily: "inherit" }}
          />
          <select 
            value={sortOrder} 
            onChange={e => setSortOrder(e.target.value)}
            style={{ flex: 1, padding: "0.6rem", border: "1px solid #e5e7eb", borderRadius: "8px", fontFamily: "inherit", background: "#fff" }}
          >
            <option value="">الترتيب الافتراضي</option>
            <option value="new">الأحدث</option>
            <option value="low">السعر: من الأقل</option>
            <option value="high">السعر: من الأعلى</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>جاري تحميل المنتجات...</div>
      ) : (
        <div className={styles.grid}>
          {displayedProducts.map(p => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      )}

      {!loading && displayedProducts.length === 0 && (
        <div className={styles.empty}>لا توجد منتجات مطابقة لبحثك.</div>
      )}

      {!loading && totalPages > 1 && !search && (
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
