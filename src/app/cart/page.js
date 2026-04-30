"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import styles from "./page.module.css";

export default function CartPage() {
  const { items, computedItems, updateQty, removeItem, total, pendingGifts, chooseGift } = useCart();
  const [activeGiftOffer, setActiveGiftOffer] = useState(null);
  const [giftProducts, setGiftProducts] = useState([]);
  const [loadingGifts, setLoadingGifts] = useState(false);

  function openGiftSelector(pg) {
      setActiveGiftOffer(pg);
      setLoadingGifts(true);
      const catIds = pg.offer.getCategories ? pg.offer.getCategories.map(c => c.id).join(',') : '';
      fetch('/api/products?categories=' + catIds)
         .then(r => r.json())
         .then(data => {
             // Handle if paged or just array
             setGiftProducts(data.products || data || []);
             setLoadingGifts(false);
         });
  }

  function handleSelectGift(product) {
      chooseGift(activeGiftOffer.offer.id, product);
      setActiveGiftOffer(null);
  }

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
            {/* Pending Gifts Alert */}
            {pendingGifts && pendingGifts.length > 0 && (
              <div className={styles.giftAlert}>
                <div className={styles.giftAlertTitle}>
                   <span className={styles.giftAlertEmoji}>🎁</span>
                   <span>مبروك! لك {pendingGifts.reduce((s, pg) => s + pg.qtyRemaining, 0)} هدايا مجانية بانتظار اختيارك.</span>
                </div>
                <button onClick={() => openGiftSelector(pendingGifts[0])} className={styles.giftAlertBtn}>
                   اختيار الهدية الآن
                </button>
              </div>
            )}
            {computedItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className={styles.item}>
                <div className={styles.itemImg}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: "2.5rem", opacity: 0.3 }}>🛍️</span>
                  }
                </div>
                <div className={styles.itemInfo}>
                  <Link href={`/product/${item.id}`} className={styles.itemName}>{item.name}</Link>
                  {item.discountReason && (
                    <span style={{ background: "#d1fae5", color: "#065f46", fontSize:"0.75rem", padding:"2px 8px", borderRadius:"12px", display:"inline-block", marginTop:"4px" }}>
                      {item.discountReason}
                    </span>
                  )}
                  <div className={styles.itemPrice}>
                    {item.effectivePrice < item.price ? (
                      <>
                        <span style={{ textDecoration: "line-through", color: "#999", fontSize: "0.85em", marginLeft: "8px" }}>{item.price} ₪</span>
                        <span style={{ color: "#dc2626", fontWeight: "bold" }}>{item.effectivePrice} ₪</span>
                      </>
                    ) : (
                      <span>{item.price} ₪</span>
                    )}
                  </div>
                  <div className={styles.itemTotal}>الإجمالي: {(item.effectivePrice * item.qty).toFixed(2)} ₪</div>
                </div>
                <div className={styles.actions}>
                  {!item.isGift ? (
                    <>
                      <div className={styles.qtyBox}>
                        <button onClick={() => updateQty(item.id, -1)}>−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)}>+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className={styles.removeBtn}>🗑 حذف</button>
                    </>
                  ) : (
                    <div style={{ color: "#059669", fontWeight: "bold", padding: "0.5rem" }}>هدية مجانية 🎁</div>
                  )}
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

      {/* Gift Modal */}
      {activeGiftOffer && (
        <div className={styles.modalOverlay}>
           <div className={styles.modalContent}>
              <button 
                onClick={() => setActiveGiftOffer(null)} 
                className={styles.modalClose}>
                ✕
              </button>
              
              <div className={styles.modalHeader}>
                 <span className={styles.modalIcon}>🎁</span>
                 <h2 className={styles.modalTitle}>مبروك، اختر هديتك!</h2>
                 <p className={styles.modalDesc}>
                   يحق لك اختيار <strong>{activeGiftOffer.qtyRemaining}</strong> منتجات مجانية من هذا القسم.
                 </p>
              </div>
              
              {loadingGifts ? <p style={{textAlign:"center", padding:"3rem"}}>⏳ جاري تحميل الهدايا المتاحة...</p> : (
                 <div className={styles.giftGrid}>
                    {giftProducts.map(p => (
                       <div key={p.id} className={styles.giftCard}>
                          <div className={styles.giftCardImgWrap}>
                             <span className={styles.giftBadgeMini}>هدية</span>
                            {p.imageUrl ? 
                              <img src={p.imageUrl} alt={p.name} className={styles.giftCardImg} /> : 
                              <span style={{fontSize: "2rem"}}>🛍️</span>}
                          </div>
                          <h4 className={styles.giftCardName}>{p.name}</h4>
                          <button onClick={() => handleSelectGift(p)} className={styles.giftCardBtn}>
                            تأكيد الاختيار
                          </button>
                       </div>
                    ))}
                    {giftProducts.length === 0 && (
                      <p style={{gridColumn:"1/-1", textAlign:"center", padding:"3rem", color: "#999"}}>لا توجد منتجات متاحة حالياً في هذا القسم.</p>
                    )}
                 </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
}
