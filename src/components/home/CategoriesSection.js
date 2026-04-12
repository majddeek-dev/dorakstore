"use client";
import Link from "next/link";
import styles from "./CategoriesSection.module.css";
import { useState, useEffect } from "react";

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/categories') // Using admin categories API, which returns all categories.
      .then(res => res.json())
      .then(data => {
        setCategories(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (categories.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>تسوق حسب الفئة</h2>
          <p className={styles.subtitle}>تصفح مجموعاتنا المتنوعة واختر ما يناسبك</p>
        </div>

        <div className={styles.grid}>
          {categories.map(cat => (
            <Link key={cat.id} href={`/shop?category=${cat.id}`} className={styles.card}>
              <div className={styles.iconWrapper}>
                {/* Could add icons to categories in DB later, using placeholder for now */}
                <span className={styles.icon}>✨</span> 
              </div>
              <h3 className={styles.catName}>{cat.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
