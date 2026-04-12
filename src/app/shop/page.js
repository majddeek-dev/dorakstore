"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import styles from "./page.module.css";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Shop() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '5rem', color: 'var(--accent)' }}>جاري الترجيز...</div>}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get('category');
  
  const [activeCategory, setActiveCategory] = useState(categoryIdParam || "all");
  const scrollRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [sortOrder, setSortOrder] = useState("");

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
        if (debouncedSearch) urlOpts.append('search', debouncedSearch);
        if (sortOrder) urlOpts.append('sort', sortOrder);
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
  }, [activeCategory, currentPage, debouncedSearch, sortOrder]);

  useEffect(() => {
    if (categoryIdParam) {
      setActiveCategory(categoryIdParam);
    }
  }, [categoryIdParam]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = 300;
      scrollRef.current.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' });
    }
  };

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setCurrentPage(1);
  }

  const handleSortChange = (val) => {
    setSortOrder(val);
    setCurrentPage(1);
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>تسوق أحدث المنتجات</h1>

      {/* شريط البحث والترتيب بمظهر احترافي */}
      <div className={styles.searchSortContainer}>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input 
            type="text" 
            placeholder="ابحث عن عطرك، ساعتك، أو ما ترغب به..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.sortWrapper}>
          <select 
            value={sortOrder} 
            onChange={e => handleSortChange(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="">✨ الترتيب الافتراضي</option>
            <option value="new">🆕 الأحدث</option>
            <option value="price_asc">💎 السعر: من الأقل</option>
            <option value="price_desc">👑 السعر: من الأعلى</option>
          </select>
        </div>
      </div>

      {/* عرض الفئات بصور */}
      <div className={styles.categoriesWrapper}>
        <button onClick={() => scroll('right')} className={styles.scrollBtn} aria-label="السابق">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 20, height: 20 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <div className={styles.categoriesContainer} ref={scrollRef}>
          <button
            className={`${styles.catCard} ${activeCategory === "all" ? styles.activeCat : ""}`}
            onClick={() => handleCategoryChange("all")}
          >
            <div className={styles.catImageWrap}>🛍️</div>
            <span className={styles.catName}>الكل</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`${styles.catCard} ${activeCategory === cat.id ? styles.activeCat : ""}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              <div className={styles.catImageWrap}>
                {cat.imageUrl ? (
                   // eslint-disable-next-line @next/next/no-img-element
                   <img src={cat.imageUrl} alt={cat.name} className={styles.catImg} />
                ) : "✨"}
              </div>
              <span className={styles.catName}>{cat.name}</span>
            </button>
          ))}
        </div>

        <button onClick={() => scroll('left')} className={styles.scrollBtn} aria-label="التالي">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 20, height: 20 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>جاري تحميل أروع المنتجات...</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map(p => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className={styles.empty}>لا توجد منتجات مطابقة لبحثك، جرب استخدام كلمات أخرى.</div>
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
