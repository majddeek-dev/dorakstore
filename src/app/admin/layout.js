'use client';
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./layout.module.css";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className={styles.adminContainer}>
      <button className={styles.burger} onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? '✕' : '☰'}
      </button>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <Link href="/admin">Dorak <span>Admin</span></Link>
        </div>
        <nav className={styles.nav}>
          <Link href="/admin" className={pathname === '/admin' ? styles.active : ''}>لوحة القيادة</Link>
          <Link href="/admin/orders" className={pathname.startsWith('/admin/orders') ? styles.active : ''}>الطلبات</Link>
          <Link href="/admin/products" className={pathname.startsWith('/admin/products') ? styles.active : ''}>المنتجات</Link>
          <Link href="/admin/contact-products" className={pathname.startsWith('/admin/contact-products') ? styles.active : ''}>منتجات التواصل</Link>
          <Link href="/admin/customers" className={pathname.startsWith('/admin/customers') ? styles.active : ''}>العملاء</Link>
          <Link href="/admin/discounts" className={pathname.startsWith('/admin/discounts') ? styles.active : ''}>خصومات</Link>
          <Link href="/admin/categories" className={pathname.startsWith('/admin/categories') ? styles.active : ''}>الفئات</Link>
          <Link href="/admin/combos" className={pathname.startsWith('/admin/combos') ? styles.active : ''}>الكومبو</Link>
          <Link href="/admin/accounting" className={pathname.startsWith('/admin/accounting') ? styles.active : ''}>حسابات</Link>
          <Link href="/" className={`${styles.storeLink} ${pathname === '/' ? styles.active : ''}`}>العودة للمتجر</Link>
        </nav>
        <button
          onClick={handleLogout}
          style={{
            marginTop: 'auto',
            background: 'rgba(220,38,38,0.15)',
            color: '#ef4444',
            border: '1px solid rgba(220,38,38,0.3)',
            borderRadius: '8px',
            padding: '0.7rem 1rem',
            cursor: 'pointer',
            fontFamily: "'Tajawal', sans-serif",
            fontWeight: '600',
            fontSize: '0.95rem',
            width: '100%',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(220,38,38,0.25)'}
          onMouseLeave={e => e.target.style.background = 'rgba(220,38,38,0.15)'}
        >
          🚪 تسجيل الخروج
        </button>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
