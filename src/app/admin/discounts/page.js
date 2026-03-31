"use client";
import { useState, useEffect } from "react";

export default function AdminDiscounts() {
  const [memberDiscount, setMemberDiscount] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [settings, setSettings] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSetting, setSavingSetting] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: "", percent: "" });
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [settingsRes, couponsRes, productsRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/coupons"),
        fetch("/api/products")
      ]);
      const settingsData = await settingsRes.json();
      const couponsData = await couponsRes.json();
      const productsData = await productsRes.json();
      
      setSettings(settingsData);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setMemberDiscount(settingsData.member_discount_percent || 0);
      setCoupons(Array.isArray(couponsData) ? couponsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateSetting(key, value) {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) {
        setSettings(prev => ({ ...prev, [key]: value }));
      }
    } catch (err) {
      console.error("Failed to update setting", err);
    }
  }

  async function updateMemberDiscount() {
    setSavingSetting(true);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "member_discount_percent", value: memberDiscount })
      });
      alert("تم تحديث نسبة خصم الأعضاء بنجاح");
    } catch (err) {
      alert("فشل التحديث");
    } finally {
      setSavingSetting(false);
    }
  }

  async function createCoupon(e) {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.percent) return;
    setCreatingCoupon(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newCoupon.code, discountPercent: newCoupon.percent })
      });
      if (res.ok) {
        setNewCoupon({ code: "", percent: "" });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "فشل إنشاء الكوبون");
      }
    } catch (err) {
      alert("خطأ في الاتصال");
    } finally {
      setCreatingCoupon(false);
    }
  }

  async function deleteCoupon(id) {
    if (!confirm("هل أنت متأكد من حذف هذا الكوبون؟")) return;
    try {
      await fetch("/api/admin/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      fetchData();
    } catch (err) {
      alert("فشل الحذف");
    }
  }

  if (loading) return <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>جاري تحميل الإعدادات...</div>;

  return (
    <div style={{ maxWidth: "900px", direction: "rtl", fontFamily: "'Tajawal', sans-serif" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#111" }}>إدارة الخصومات والكوبونات</h1>
        <p style={{ color: "#666" }}>تحكم في عروض المتجر، خصم الأعضاء، وأكواد الخصم الترويجية.</p>
      </header>

      <section style={cardStyle}>
        <h2 style={sectionTitle}>👤 خصم الأعضاء المسجلين</h2>
        <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1.5rem" }}>هذا الخصم يتم تطبيقه تلقائياً لكل زبون مسجل دخول في حسابه.</p>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ position: "relative", width: "150px" }}>
            <input 
              type="number" 
              value={memberDiscount} 
              onChange={e => setMemberDiscount(e.target.value)}
              style={{ padding: "0.8rem", borderRadius: "8px", border: "1px solid #ddd", width: "100%", fontSize: "1.1rem", fontWeight: 700 }}
            />
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: "#888" }}>%</span>
          </div>
          <button 
            onClick={updateMemberDiscount}
            disabled={savingSetting}
            style={{ background: "#4338ca", color: "#fff", padding: "0.8rem 1.5rem", borderRadius: "8px", border: "none", fontWeight: 700, cursor: "pointer" }}
          >
            {savingSetting ? "جاري الحفظ..." : "حفظ النسبة"}
          </button>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={sectionTitle}>🔥 إدارة عرض اليوم (Flash Sale)</h2>
        <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1.5rem" }}>تحكم في عرض المنتج المميز الذي يظهر في الصفحة الرئيسية مع عداد تنازلي.</p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <label style={{ fontWeight: 700 }}>حالة العرض:</label>
            <button 
              onClick={() => updateSetting("flash_sale_enabled", settings.flash_sale_enabled === "true" ? "false" : "true")}
              style={{ 
                background: settings.flash_sale_enabled === "true" ? "#10b981" : "#ef4444", 
                color: "#fff", padding: "0.5rem 1rem", borderRadius: "20px", border: "none", fontWeight: 700, cursor: "pointer" 
              }}
            >
              {settings.flash_sale_enabled === "true" ? "✅ مفعّل" : "❌ معطّل"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 700 }}>المنتج المختار للعرض:</label>
            <select 
              value={settings.flash_sale_product_id || ""} 
              onChange={e => updateSetting("flash_sale_product_id", e.target.value)}
              style={{ ...inputStyle, width: "100%", maxWidth: "400px" }}
            >
              <option value="">-- اختر منتجاً --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.price} ₪)</option>
              ))}
            </select>
            <p style={{ fontSize: "0.8rem", color: "#999" }}>ملاحظة: إذا لم تقم باختيار منتج، سيقوم النظام باختيار منتج عشوائي عليه خصم.</p>
          </div>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={sectionTitle}>🎟️ أكواد الخصم (كوبونات)</h2>
        <form onSubmit={createCoupon} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem", padding: "1.5rem", background: "#f9fafb", borderRadius: "12px" }}>
          <input 
            type="text" 
            placeholder="كود الخصم (مثال: DK7SALE)" 
            value={newCoupon.code}
            onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
            style={{ ...inputStyle, flex: 2 }}
          />
          <input 
            type="number" 
            placeholder="النسبة %" 
            value={newCoupon.percent}
            onChange={e => setNewCoupon({ ...newCoupon, percent: e.target.value })}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button 
            type="submit"
            disabled={creatingCoupon}
            style={{ background: "#111", color: "#fff", padding: "0.8rem 1.5rem", borderRadius: "8px", border: "none", fontWeight: 700, cursor: "pointer", flex: 1 }}
          >
            {creatingCoupon ? "جاري الإضافة..." : "إضافة كوبون"}
          </button>
        </form>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #eee", fontSize: "0.85rem", color: "#888" }}>
                <th style={cellStyle}>كود الخصم</th>
                <th style={cellStyle}>قيمة الخصم</th>
                <th style={cellStyle}>تاريخ الإنشاء</th>
                <th style={cellStyle}>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                  <td style={{ ...cellStyle, fontWeight: 800, color: "#111" }}>{c.code}</td>
                  <td style={cellStyle}>
                    <span style={{ background: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: 700 }}>{c.discountPercent}% -</span>
                  </td>
                  <td style={{ ...cellStyle, fontSize: "0.85rem", color: "#999" }}>{new Date(c.createdAt).toLocaleDateString('ar-EG')}</td>
                  <td style={cellStyle}>
                    <button 
                      onClick={() => deleteCoupon(c.id)}
                      style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700 }}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr><td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: "#bbb" }}>لا توجد كوبونات خصم حالياً.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const cardStyle = { background: "#fff", padding: "2rem", borderRadius: "16px", border: "1px solid #eee", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", marginBottom: "2rem" };
const sectionTitle = { fontSize: "1.2rem", fontWeight: 800, marginBottom: "1rem", color: "#111" };
const inputStyle = { padding: "0.8rem", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.95rem", outline: "none" };
const cellStyle = { padding: "1rem 0.5rem" };
