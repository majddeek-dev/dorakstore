"use client";
import { useState, useEffect } from "react";

export default function AdminGiftOffers() {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    buyProductId: "", buyCategoryId: "", minPrice: "", getProductId: "", getCategoryId: "", isActive: true
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [oRes, pRes, cRes] = await Promise.all([
        fetch("/api/admin/gift-offers"),
        fetch("/api/products?admin=true"),
        fetch("/api/categories")
      ]);
      const oData = await oRes.json();
      const pData = await pRes.json();
      const cData = await cRes.json();
      
      setOffers(Array.isArray(oData) ? oData : []);
      setProducts(Array.isArray(pData) ? pData : []);
      setCategories(Array.isArray(cData) ? cData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setForm({ 
      buyProductId: "", 
      buyCategoryId: "", 
      minPrice: "",
      getProductId: "", 
      getCategoryId: "",
      isActive: true 
    });
    setModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = form.id ? `/api/admin/gift-offers/${form.id}` : "/api/admin/gift-offers";
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert("خطأ: " + err.error);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("هل أنت متأكد من حذف هذا العرض؟")) return;
    try {
      await fetch(`/api/admin/gift-offers/${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      alert("فشل الحذف");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: 0 }}>عروض الهدايا</h1>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>إعداد عروض "اشتري قطعة واحصل على الأخرى مجاناً"</p>
        </div>
        <button onClick={openAdd} style={btnStyle("#111")}>+ إنشاء عرض هدية</button>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#999" }}>جاري التحميل...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
            <thead>
              <tr style={{ background: "#fafafa", color: "#888", fontSize: "0.85rem" }}>
                <th style={{ padding: "0.9rem 1.2rem" }}>اشتري منتج</th>
                <th style={{ padding: "0.9rem 1.2rem" }}>احصل على منتج</th>
                <th style={{ padding: "0.9rem 1.2rem" }}>الحالة</th>
                <th style={{ padding: "0.9rem 1.2rem" }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(o => (
                <tr key={o.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "0.9rem 1.2rem", fontWeight: 700 }}>
                    {o.buyProduct ? o.buyProduct.name : ""}
                    {o.buyCategory ? `أي منتج من قسم (${o.buyCategory.name}) ` : ""}
                    {o.minPrice ? `بشرط السعر أكبر من ${o.minPrice} ₪` : ""}
                  </td>
                  <td style={{ padding: "0.9rem 1.2rem", color: "#059669", fontWeight: 700 }}>
                    {o.getProduct ? `🎁 ${o.getProduct.name}` : ""}
                    {o.getCategory ? `🎁 اختيار العميل من قسم (${o.getCategory.name})` : ""}
                  </td>
                  <td style={{ padding: "0.9rem 1.2rem" }}>
                    <span style={{ 
                      background: o.isActive ? "#d1fae5" : "#fee2e2", 
                      color: o.isActive ? "#065f46" : "#991b1b", 
                      padding: "3px 10px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 600 
                    }}>
                      {o.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </td>
                  <td style={{ padding: "0.9rem 1.2rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => { setForm(o); setModal(true); }} style={btnSmall("#6366f1")}>تعديل</button>
                      <button onClick={() => handleDelete(o.id)} style={btnSmall("#dc2626")}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
              {offers.length === 0 && (
                <tr><td colSpan={4} style={{ padding: "2.5rem", textAlign: "center", color: "#bbb" }}>لا توجد عروض هدايا حالياً</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", direction: "rtl" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800 }}>{form.id ? "تعديل عرض" : "إنشاء عرض"}</h2>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#888" }}>✕</button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                <p style={{ margin: "0 0 1rem 0", fontWeight: 700, fontSize: "0.95rem", color: "#374151" }}>شروط الحصول على الهدية (اختر واحدة أو ادمج بينها):</p>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={lblStyle}>إذا اشترى الزبون المنتج حصراً والتزم به:</label>
                  <select value={form.buyProductId || ""} onChange={e => setForm({...form, buyProductId: e.target.value})} style={inpStyle}>
                    <option value="">-- اختياري: غير محدد --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                
                <div style={{ marginBottom: "1rem" }}>
                  <label style={lblStyle}>أو إذا اشترى أي منتج من هذا القسم / الفئة:</label>
                  <select value={form.buyCategoryId || ""} onChange={e => setForm({...form, buyCategoryId: e.target.value})} style={inpStyle}>
                    <option value="">-- اختياري: كل الأقسام --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={lblStyle}>بشرط أن يتجاوز سعر المنتج (₪):</label>
                  <input type="number" placeholder="مثال: 100" value={form.minPrice || ""} onChange={e => setForm({...form, minPrice: e.target.value})} style={inpStyle} />
                </div>
              </div>
              
              <div style={{ background: "#f0fdf4", padding: "1rem", borderRadius: "8px", border: "1px solid #dcfce3" }}>
                <p style={{ margin: "0 0 1rem 0", fontWeight: 700, fontSize: "0.95rem", color: "#166534" }}>الهدية التي سيحصل عليها العميل (اختر إحداها فقط):</p>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={lblStyle}>إعطاء منتج محدد بشكل مباشر:</label>
                  <select value={form.getProductId || ""} onChange={e => setForm({...form, getProductId: e.target.value, getCategoryId: ""})} style={inpStyle}>
                    <option value="">-- اختياري: غير محدد --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={lblStyle}>أو السماح للعميل باختيار أي منتج من هذا القسم لمجاناً:</label>
                  <select value={form.getCategoryId || ""} onChange={e => setForm({...form, getCategoryId: e.target.value, getProductId: ""})} style={inpStyle}>
                    <option value="">-- اختياري: غير محدد --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={lblStyle}>الحالة</label>
                <select value={form.isActive} onChange={e => setForm({...form, isActive: e.target.value === 'true'})} style={inpStyle}>
                  <option value="true">نشط</option>
                  <option value="false">غير نشط</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="submit" disabled={saving} style={{ ...btnStyle("#111"), flex: 1, padding: "0.85rem", fontSize: "1rem" }}>
                  {saving ? "جاري الحفظ..." : "حفظ العرض"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const lblStyle = { display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.9rem", color: "#555" };
const inpStyle = { width: "100%", padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "0.95rem", fontFamily: "'Tajawal', sans-serif" };

function btnStyle(bg) { return { background: bg, color: "#fff", border: "none", padding: "0.65rem 1.3rem", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "'Tajawal', sans-serif" }; }
function btnSmall(bg) { return { background: bg, color: "#fff", border: "none", padding: "0.4rem 0.9rem", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontFamily: "'Tajawal', sans-serif", fontSize: "0.82rem" }; }
