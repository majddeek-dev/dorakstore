"use client";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import styles from "./page.module.css";

export default function CartPage() {
  const { items, updateQty, removeItem, total } = useCart();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>سلة المشتريات</h1>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🛒</div>
          <p>سلة المشتريات فارغة.</p>
          <Link href="/shop" className={styles.continueBtn}>التسوق الآن</Link>
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.itemsList}>
            {items.map(item => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImg}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: "2.5rem", opacity: 0.3 }}>🛍️</span>
                  }
                </div>
                <div className={styles.itemInfo}>
                  <Link href={`/product/${item.id}`} className={styles.itemName}>{item.name}</Link>
                  <div className={styles.itemPrice}>{item.price} ₪</div>
                  <div className={styles.itemTotal}>الإجمالي: {(item.price * item.qty).toFixed(2)} ₪</div>
                </div>
                <div className={styles.actions}>
                  <div className={styles.qtyBox}>
                    <button onClick={() => updateQty(item.id, -1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className={styles.removeBtn}>🗑 حذف</button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <h3>ملخص الطلب</h3>
            <div className={styles.summaryRow}>
              <span>عدد المنتجات</span>
              <span>{items.reduce((s, i) => s + i.qty, 0)} قطعة</span>
            </div>
            <div className={styles.summaryRow}>
              <span>المجموع الفرعي</span>
              <span>{total.toFixed(2)} ₪</span>
            </div>
            <div className={styles.summaryRow}>
              <span>الشحن</span>
              <span>يحسب في الدفع</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>الإجمالي</span>
              <span>{total.toFixed(2)} ₪</span>
            </div>
            <Link href="/checkout" className={styles.checkoutBtn}>متابعة الدفع →</Link>
            <Link href="/shop" className={styles.continueShop}>← متابعة التسوق</Link>
          </div>
        </div>
      )}
    </div>
  );
}
