"use client";
import { useState, useEffect } from "react";

export default function AdminPriceRules() {
  const [rules, setRules] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    productId: "", minQty: "", price: "", label: ""
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [rRes, pRes] = await Promise.all([
        fetch("/api/admin/price-rules"),
        fetch("/api/products?admin=true")
      ]);
      const rData = await rRes.json();
      const pData = await pRes.json();
      
      setRules(Array.isArray(rData) ? rData : []);
      setProducts(Array.isArray(pData) ? pData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setForm({ 
      productId: products.length > 0 ? products[0].id : "", 
      minQty: "", 
      price: "", 
      label: "" 
    });
    setModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = form.id ? `/api/admin/price-rules/${form.id}` : "/api/admin/price-rules";
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
    if (!confirm("هل أنت متأكد من حذف هذا الخصم؟")) return;
    try {
      await fetch(`/api/admin/price-rules/${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      alert("فشل الحذف");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: 0 }}>خصومات الكمية</h1>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>إعداد أسعار خاصة عند شراء كميات أكبر من المنتج</p>
        </div>
        <button onClick={openAdd} style={btnStyle("#111")}>+ إنشاء خصم كمية</button>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#999" }}>جاري التحميل...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
            <thead>
              <tr style={{ background: "#fafafa", color: "#888", fontSize: "0.85rem" }}>
                <th style={{ padding: "0.9rem 1.2rem" }}>المنتج</th>
                <th style={{ padding: "0.9rem 1.2rem" }}>الكمية المطلوبة (الحد الأدنى)</th>
                <th style={{ padding: "0.9rem 1.2rem" }}>السعر للقطعة الواحدة</th>
                <th style={{ padding: "0.9rem 1.2rem" }}>عنوان التمييز</th>
                <th style={{ padding: "0.9rem 1.2rem" }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "0.9rem 1.2rem", fontWeight: 700 }}>{r.product?.name}</td>
                  <td style={{ padding: "0.9rem 1.2rem" }}>{r.minQty} وما فوق</td>
                  <td style={{ padding: "0.9rem 1.2rem", color: "#059669", fontWeight: 700 }}>{r.price} شيكل</td>
                  <td style={{ padding: "0.9rem 1.2rem" }}>{r.label || "-"}</td>
                  <td style={{ padding: "0.9rem 1.2rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => { setForm(r); setModal(true); }} style={btnSmall("#6366f1")}>تعديل</button>
                      <button onClick={() => handleDelete(r.id)} style={btnSmall("#dc2626")}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr><td colSpan={5} style={{ padding: "2.5rem", textAlign: "center", color: "#bbb" }}>لا توجد خصومات على الكمية حالياً</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", direction: "rtl" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800 }}>{form.id ? "تعديل خصم" : "إنشاء خصم كمية"}</h2>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#888" }}>✕</button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={lblStyle}>المنتج *</label>
                <select required value={form.productId} onChange={e => setForm({...form, productId: e.target.value})} style={inpStyle}>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={lblStyle}>الكمية الأدنى المطلوبة *</label>
                  <input required type="number" min="2" value={form.minQty} onChange={e => setForm({...form, minQty: e.target.value})} style={inpStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={lblStyle}>السعر للقطعة الواحدة *</label>
                  <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} style={inpStyle} />
                </div>
              </div>

              <div>
                <label style={lblStyle}>عنوان للتمييز (مثال: خصم الجملة)</label>
                <input type="text" value={form.label || ""} onChange={e => setForm({...form, label: e.target.value})} style={inpStyle} placeholder="اختياري" />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="submit" disabled={saving} style={{ ...btnStyle("#111"), flex: 1, padding: "0.85rem", fontSize: "1rem" }}>
                  {saving ? "جاري الحفظ..." : "حفظ الخصم"}
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
