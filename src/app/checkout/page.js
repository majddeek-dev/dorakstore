"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import styles from "./page.module.css";

export default function CheckoutPage() {
  const { items, subtotal, memberDiscount, memberDiscountPercent, total: cartTotal, user, clearCart } = useCart();
  const router = useRouter();
  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState(null);
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const SHIPPING_RATES = {
    "الضفة الغربية": 20,
    "القدس": 30,
    "مناطق 48 (الداخل)": 70,
    "قطاع غزة": 30,
  };

  const shipping = SHIPPING_RATES[region] || 0;

  // Coupon calculation
  const couponDiscount = couponData ? (subtotal * (couponData.discountPercent / 100)) : 0;
  const grandTotal = cartTotal - couponDiscount + shipping;

  async function handleApplyCoupon(e) {
    e.preventDefault();
    if (!couponCode) return;
    setValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (res.ok) {
        setCouponData(data);
      } else {
        alert(data.error || "كود الخصم غير صحيح");
      }
    } catch {
      alert("خطأ في الاتصال");
    } finally {
      setValidatingCoupon(false);
    }
  }

  async function handleCheckout(e) {
    e.preventDefault();
    if (items.length === 0) {
      alert("سلة المشتريات فارغة.");
      return;
    }
    setLoading(true);

    const formData = new FormData(e.target);
    const orderData = {
      customerName: formData.get("name"),
      customerPhone: formData.get("phone"),
      region: formData.get("region"),
      address: formData.get("address"),
      total: grandTotal,
      items: items.map(i => ({ id: i.id, qty: i.qty, price: i.price })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        clearCart();
        router.push("/checkout/success");
      } else {
        const err = await res.json();
        alert("حدث خطأ أثناء حفظ الطلب: " + (err.error || ""));
        setLoading(false);
      }
    } catch {
      alert("خطأ في الاتصال بالخادم.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className={styles.container} style={{ textAlign: "center", padding: "4rem" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🛒</div>
        <h2>لا يوجد منتجات في السلة</h2>
        <a href="/shop" className={styles.submitBtn} style={{ display: "inline-block", marginTop: "1rem" }}>
          تسوّق الآن
        </a>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>إتمام الطلب</h1>

      <div className={styles.layout}>
        {/* Mobile Summary Toggle */}
        <div className={styles.mobileSummaryToggle} onClick={() => setShowSummary(!showSummary)}>
          <div className={styles.toggleText}>
            <span>🛒 عرض ملخص الطلب</span>
            <span className={`${styles.arrow} ${showSummary ? styles.arrowUp : ""}`}>▼</span>
          </div>
          <span className={styles.toggleTotal}>{grandTotal.toFixed(2)} ₪</span>
        </div>

        {/* Order Summary */}
        <div className={`${styles.orderSummary} ${showSummary ? styles.showOnMobile : ""}`}>
          <div className={styles.summaryHeader}>
            <h2>ملخص الطلب</h2>
            <button className={styles.closeSummary} onClick={() => setShowSummary(false)}>✕</button>
          </div>

          {/* Items list */}
          <div className={styles.itemsList}>
            {items.map(i => (
              <div key={i.id} className={styles.summaryItem}>
                <span className={styles.summaryItemName}>{i.name}</span>
                <span className={styles.summaryItemQty}>× {i.qty}</span>
                <span className={styles.summaryItemPrice}>{(i.price * i.qty).toFixed(2)} ₪</span>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className={styles.discount}>
            <form onSubmit={handleApplyCoupon} className={styles.discountForm}>
              <input
                type="text"
                placeholder="رمز الكوبون"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                disabled={!!couponData}
              />
              <button type="submit" disabled={!!couponData || validatingCoupon}>
                {validatingCoupon ? "⏳" : "تطبيق"}
              </button>
            </form>
            {couponData && <p className={styles.successMsg}>✅ تم تطبيق كود {couponData.code} بنجاح!</p>}
          </div>

          {/* Pricing breakdown */}
          <div className={styles.pricing}>
            <div className={styles.row}>
              <span>المجموع الفرعي</span>
              <span>{subtotal.toFixed(2)} ₪</span>
            </div>

            {memberDiscount > 0 && (
              <div className={`${styles.row} ${styles.discountRow}`}>
                <span>خصم الأعضاء ({memberDiscountPercent}%)</span>
                <span>-{memberDiscount.toFixed(2)} ₪</span>
              </div>
            )}

            {couponData && (
              <div className={`${styles.row} ${styles.discountRow}`}>
                <span>كود الخصم ({couponData.discountPercent}%)</span>
                <span>-{couponDiscount.toFixed(2)} ₪</span>
              </div>
            )}

            <div className={styles.row}>
              <span>مصاريف الشحن</span>
              <span style={{ color: shipping === 0 ? "#888" : "inherit" }}>
                {shipping > 0 ? `${shipping.toFixed(2)} ₪` : "يرجى اختيار المنطقة"}
              </span>
            </div>
            <div className={`${styles.row} ${styles.totalRow}`}>
              <span>الإجمالي</span>
              <span>{grandTotal.toFixed(2)} ₪</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className={styles.formSection}>
          <form onSubmit={handleCheckout} className={styles.form}>
            <div className={styles.group}>
              <label>الاسم الكامل</label>
              <input type="text" name="name" required placeholder="محمد أحمد" defaultValue={user?.name || ""} />
            </div>
            <div className={styles.group}>
              <label>رقم الهاتف المحمول</label>
              <input type="tel" name="phone" required placeholder="0590000000" defaultValue={user?.phone || ""} />
            </div>
            <div className={styles.group}>
              <label>المنطقة</label>
              <select
                name="region"
                required
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="">اختر المنطقة...</option>
                <option value="الضفة الغربية">الضفة الغربية (20 ₪)</option>
                <option value="القدس">القدس (30 ₪)</option>
                <option value="مناطق 48 (الداخل)">الداخل المحتل - مناطق 48 (70 ₪)</option>
              </select>
            </div>
            <div className={styles.group}>
              <label>العنوان بالتفصيل</label>
              <input type="text" name="address" required placeholder="البلد, الشارع....." />
            </div>
            <div className={styles.paymentMethod}>
              <h3>طريقة الدفع</h3>
              <div className={styles.radioGroup}>
                <input type="radio" id="cod" name="payment" defaultChecked readOnly />
                <label htmlFor="cod">💵 الدفع النقدي عند الاستلام (COD)</label>
              </div>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "⏳ جاري التأكيد..." : "✅ تأكيد الطلب"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
