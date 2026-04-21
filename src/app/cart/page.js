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
      fetch('/api/products?category=' + pg.offer.getCategoryId)
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
              <div style={{ background: "#f0fdf4", border: "1px solid #16a34a", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                   <span style={{ fontSize: "1.8rem", marginLeft: "10px" }}>🎁</span>
                   <span style={{ fontWeight: 700, color: "#166534" }}>مبروك! لك {pendingGifts.reduce((s, pg) => s + pg.qtyRemaining, 0)} هدايا مجانية بانتظار اختيارك.</span>
                </div>
                <button onClick={() => openGiftSelector(pendingGifts[0])} style={{ background: "#16a34a", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "0.95rem" }}>
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
        <div style={{position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"}}>
           <div style={{background: "#fff", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "600px", maxHeight: "85vh", overflowY: "auto", position: "relative"}}>
              <button 
                onClick={() => setActiveGiftOffer(null)} 
                style={{position: "absolute", top: "1rem", left: "1rem", border: "none", background: "#f3f4f6", padding: "5px 10px", borderRadius: "6px", fontSize: "1.2rem", cursor: "pointer"}}>
                ✕
              </button>
              <h2 style={{color: "#166534", marginBottom: "1rem"}}>اختر هديتك المجانية</h2>
              <p style={{marginBottom: "1.5rem", color: "#666", fontSize:"0.95rem"}}>يحق لك اختيار {activeGiftOffer.qtyRemaining} منتجات مجانياً من الأجهزة المتاحة لتضاف كهدية.</p>
              
              {loadingGifts ? <p style={{textAlign:"center", padding:"2rem"}}>⏳ جاري تحميل الهدايا المتاحة...</p> : (
                 <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "1rem"}}>
                    {giftProducts.map(p => (
                       <div key={p.id} style={{border: "1px solid #e5e7eb", padding: "0.75rem", borderRadius: "8px", textAlign: "center", display:"flex", flexDirection:"column", justifyContent:"space-between"}}>
                          {p.imageUrl ? 
                            <img src={p.imageUrl} alt={p.name} style={{width: "100%", height: "120px", objectFit: "cover", borderRadius: "6px"}} /> : 
                            <div style={{height: "120px", background: "#f5f5f5", borderRadius:"6px", display:"flex", alignItems:"center", justifyContent:"center"}}>🛍️</div>}
                          <h4 style={{margin: "0.5rem 0", fontSize:"0.9rem"}}>{p.name}</h4>
                          <button onClick={() => handleSelectGift(p)} style={{background: "#16a34a", color: "#fff", border: "none", padding: "0.5rem", borderRadius: "6px", cursor: "pointer", width: "100%", fontSize:"0.85rem", fontWeight:"bold"}}>
                            اختيار
                          </button>
                       </div>
                    ))}
                    {giftProducts.length === 0 && (
                      <p style={{gridColumn:"1/-1", textAlign:"center", padding:"2rem"}}>لا توجد منتجات متاحة حالياً.</p>
                    )}
                 </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
}
