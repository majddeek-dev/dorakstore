'use client';
import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import styles from "./ProductCard.module.css";

export default function ProductCard({ id, name, price, oldPrice, imageUrl, badge }) {
  const { addItem, user, memberDiscountPercent } = useCart();

  const memberPrice = user ? price * (1 - memberDiscountPercent / 100) : null;

  function handleAdd(e) {
    e.preventDefault();
    addItem({ id, name, price, imageUrl });
  }

  return (
    <div className={styles.card}>
      {(badge || (user && memberDiscountPercent > 0)) && (
        <div className={styles.badge}>
          {badge || `خصم الأعضاء ${memberDiscountPercent}%`}
        </div>
      )}
      <Link href={`/product/${id}`} className={styles.imageWrap}>
        <div className={styles.placeholderImage}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={name} className={styles.img} />
          ) : (
            <span className={styles.noImg}>🛍️</span>
          )}
        </div>
      </Link>
      <div className={styles.info}>
        <Link href={`/product/${id}`}>
          <h3 className={styles.name}>{name}</h3>
        </Link>
        <div className={styles.pricing}>
          {user && memberPrice ? (
            <>
              <span className={styles.price}>{memberPrice.toFixed(2)} ₪</span>
              <span className={styles.oldPrice} style={{ textDecoration: 'line-through', fontSize: '0.8rem' }}>{price} ₪</span>
            </>
          ) : (
            <>
              <span className={styles.price}>{price} ₪</span>
              {oldPrice && <span className={styles.oldPrice}>{oldPrice} ₪</span>}
            </>
          )}
        </div>
        <button className={styles.addToCart} onClick={handleAdd} aria-label="أضف إلى السلة">
          🛒 أضف إلى السلة
        </button>
      </div>
    </div>
  );
}
