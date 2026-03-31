"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Hero.module.css";

const IMAGES = ["/hero1.jpg", "/hero2.jpg", "/hero3.jpg"];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.hero}>
      {IMAGES.map((img, i) => (
        <div
          key={img}
          className={`${styles.bgLayer} ${i === index ? styles.active : ""}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      <div className={styles.overlay} />

      <div className={styles.content}>
        <h1 className={styles.title}>كل ما تحتاجه في مكان واحد</h1>
        <p className={styles.subtitle}>
          اكتشف تشكيلتنا الحصرية من العطور، الساعات، النظارات، والحقائب وفرناها خصيصاً لك.
        </p>
        <Link href="/shop" className={styles.ctaBtn}>تسوق الآن</Link>
      </div>
    </section>
  );
}
