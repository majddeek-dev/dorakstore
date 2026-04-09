"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { useCart } from "@/lib/CartContext";
import ProductCard from "@/components/ui/ProductCard";

export default function ProductDetails() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProduct(data);

        // Load related products (same category, exclude self)
        const allRes = await fetch(`/api/products?category=${data.category}`);
        const allData = await allRes.json();
        setRelatedProducts(allData.filter(p => p.id !== id).slice(0, 4));
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", fontSize: "1.2rem" }}>
        جاري تحميل المنتج...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <h2>المنتج غير موجود</h2>
        <Link href="/shop" style={{ color: "#111", textDecoration: "underline" }}>
          العودة للمتجر
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/">الرئيسية</Link> / <Link href="/shop">المتجر</Link> / <span>{product.name}</span>
      </div>

      <div className={styles.main}>
        <div className={styles.gallery}>
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
          ) : (
            <div className={styles.placeholderImage}>
              <span style={{ fontSize: "5rem", opacity: 0.2 }}>🛍️</span>
            </div>
          )}
          {product.badge && (
            <div className={styles.badgeOverlay}>{product.badge}</div>
          )}
        </div>

        <div className={styles.details}>
          <h1 className={styles.title}>{product.name}</h1>
          <div className={styles.pricing}>
            <span className={styles.price}>{product.price} ₪</span>
            {!!product.oldPrice && product.oldPrice > product.price && (
              <>
                <span className={styles.oldPrice}>{product.oldPrice} ₪</span>
                <span className={styles.discount}>
                  وفّر {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          {product.desc && <p className={styles.desc}>{product.desc}</p>}

          {product.stock === 0 ? (
            <div className={styles.outOfStock}>❌ نفد من المخزون حالياً</div>
          ) : product.stock <= 5 ? (
            <div className={styles.stockWarning}>
              ⚠️ تبقّى {product.stock} قطع فقط في المخزون!
            </div>
          ) : null}

          {product.stock > 0 && (
            <div className={styles.actions}>
              <div className={styles.qtyBox}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
              </div>
              <button
                className={added ? styles.addedToCart : styles.addToCart}
                onClick={handleAddToCart}
                disabled={added}
              >
                {added ? "✅ تمت الإضافة!" : "🛒 أضف إلى السلة"}
              </button>
            </div>
          )}

          <div className={styles.features}>
            <p>🚚 شحن سريع لفلسطين والـ 48</p>
            <p>💳 الدفع عند الاستلام متاح</p>
            <p>↩️ إمكانية الإرجاع خلال 7 أيام</p>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className={styles.relatedSection}>
          <h2 className={styles.sectionTitle}>منتجات قد تعجبك</h2>
          <div className={styles.grid}>
            {relatedProducts.map(p => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
