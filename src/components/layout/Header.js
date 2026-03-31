"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import styles from "./Header.module.css";

export default function Header() {
  const { count } = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu when pathname changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Left: Burger for Mobile */}
        <button
          className={`${styles.burger} ${menuOpen ? styles.burgerActive : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Center/Right: Logo */}
        <div className={styles.logo}>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="DK7 Store"
              width={100}
              height={40}
              priority
              style={{ width: 'auto', height: '40px', objectFit: 'contain' }}
              className={styles.logoImage}
            />
          </Link>
        </div>

        {/* Desktop Nav / Mobile Drawer */}
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
          <div className={styles.navHeader}>
            <button className={styles.closeBtn} onClick={() => setMenuOpen(false)}>✕</button>
            <span className={styles.navLogo}>Dorak Store</span>
          </div>
          <div className={styles.navLinks}>
            <Link href="/" className={pathname === "/" ? styles.active : ""}>الرئيسية</Link>
            <Link href="/shop" className={pathname === "/shop" ? styles.active : ""}>المتجر</Link>
            <Link href="/about" className={pathname === "/about" ? styles.active : ""}>من نحن</Link>
            <Link href="/contact" className={pathname === "/contact" ? styles.active : ""}>اتصل بنا</Link>
          </div>
          {/* Mobile-only footer menu items */}
          <div className={styles.navFooter}>
            <Link href="/account">حسابي</Link>
            <Link href="/checkout">إتمام الطلب</Link>
          </div>
        </nav>

        {/* Right: Actions */}
        <div className={styles.actions}>
          <Link href="/account" className={styles.iconBtn}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
          <Link href="/cart" className={`${styles.iconBtn} ${styles.cartBtn}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {count > 0 && <span className={styles.badge}>{count}</span>}
          </Link>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && <div className={styles.overlay} onClick={() => setMenuOpen(false)} />}
    </header>
  );
}
