"use client";
import Link from "next/link";
import styles from "./CategoriesSection.module.css";
import { useState, useEffect, useRef } from "react";

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSection, setShowSection] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Fetch categories
    fetch('/api/admin/categories') 
      .then(res => res.json())
      .then(data => {
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {});

    // Fetch settings to check visibility
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.showHomeCategories === "false") {
          setShowSection(false);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300; 
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) return null;
  if (!showSection) return null;
  if (categories.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <h2 className={styles.title}>تسوق حسب الفئة</h2>
            <p className={styles.subtitle}>تصفح مجموعاتنا المتنوعة واختر ما يناسبك</p>
          </div>
          <div className={styles.navButtons}>
            <button onClick={() => scroll('right')} className={styles.navBtn} aria-label="السابق">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 20, height: 20 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            <button onClick={() => scroll('left')} className={styles.navBtn} aria-label="التالي">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 20, height: 20 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.carouselWrapper}>
          <div className={styles.grid} ref={scrollRef}>
            {categories.map(cat => (
              <Link key={cat.id} href={`/shop?category=${cat.id}`} className={styles.card}>
                <div className={styles.iconWrapper} style={{ padding: cat.imageUrl ? 0 : '', overflow: 'hidden' }}>
                  {cat.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    <span className={styles.icon}>✨</span> 
                  )}
                </div>
                <h3 className={styles.catName}>{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
