"use client";
import { useState, useEffect } from "react";

export default function AdminCombos() {
  const [combos, setCombos] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: "", discountPercent: "", description: "", isActive: true, items: []
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([
        fetch("/api/admin/combos"),
        fetch("/api/products?admin=true")
      ]);
      const cData = await cRes.json();
      const pData = await pRes.json();
      
      setCombos(Array.isArray(cData) ? cData : []);
      setProducts(Array.isArray(pData) ? pData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setForm({ name: "", discountPercent: "", description: "", isActive: true, items: [] });
    setModal(true);
  }

  function addItem() {
    if (products.length === 0) return;
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { productId: products[0].id, quantity: 1 }]
    }));
  }

  function updateItem(index, field, value) {
    const newItems = [...form.items];
    newItems[index][field] = value;
    setForm({ ...form, items: newItems });
  }

  function removeItem(index) {
    const newItems = [...form.items];
    newItems.splice(index, 1);
    setForm({ ...form, items: newItems });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (form.items.length === 0) {
      alert("يجب إضافة منتج واحد على الأقل للكومبو");
      return;
    }
    setSaving(true);
    try {
      const url = form.id ? `/api/admin/combos/${form.id}` : "/api/admin/combos";
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
    if (!confirm("هل أنت متأكد من حذف هذا الكومبو؟")) return;
    try {
      await fetch(`/api/admin/combos/${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      alert("فشل الحذف");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: 0 }}>إدارة الكومبو (عروض المجموعات)</h1>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>أضف عروض لبيع عدة منتجات معاً بخصم خاص</p>
        </div>
        <button onClick={openAdd} style={btnStyle("#111")}>+ إنشاء عرض كومبو</button>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#999" }}>جاري التحميل...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
            <thead>
              <tr style={{ background: "#fafafa", color: "#888", fontSize: "0.85rem" }}>
                <th style={{ padding: "0.9rem 1.2rem" }}>الاسم</th>
                <th style={{ padding: "0.9rem 1.2rem" }}>نسبة الخصم</th>
                <th style={{ padding: "0.9rem 1.2rem" }}>عدد المنتجات</th>
                <th style={{ padding: "0.9rem 1.2rem" }}>الحالة</th>
                <th style={{ padding: "0.9rem 1.2rem" }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {combos.map(c => (
                <tr key={c.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "0.9rem 1.2rem", fontWeight: 700 }}>{c.name}</td>
                  <td style={{ padding: "0.9rem 1.2rem", color: "#059669", fontWeight: 700 }}>{c.discountPercent}%</td>
                  <td style={{ padding: "0.9rem 1.2rem" }}>{c.items?.length || 0} منتجات</td>
                  <td style={{ padding: "0.9rem 1.2rem" }}>
                    <span style={{ 
                      background: c.isActive ? "#d1fae5" : "#fee2e2", 
                      color: c.isActive ? "#065f46" : "#991b1b", 
                      padding: "3px 10px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 600 
                    }}>
                      {c.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </td>
                  <td style={{ padding: "0.9rem 1.2rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => { setForm(c); setModal(true); }} style={btnSmall("#6366f1")}>تعديل</button>
                      <button onClick={() => handleDelete(c.id)} style={btnSmall("#dc2626")}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
              {combos.length === 0 && (
                <tr><td colSpan={5} style={{ padding: "2.5rem", textAlign: "center", color: "#bbb" }}>لا توجد عروض كومبو حالياً</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", direction: "rtl" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800 }}>{form.id ? "تعديل الكومبو" : "إنشاء عرض كومبو"}</h2>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#888" }}>✕</button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={lblStyle}>اسم العرض *</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inpStyle} />
              </div>
              
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={lblStyle}>نسبة الخصم % *</label>
                  <input required type="number" min="0" max="100" value={form.discountPercent} onChange={e => setForm({...form, discountPercent: e.target.value})} style={inpStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={lblStyle}>الحالة</label>
                  <select value={form.isActive} onChange={e => setForm({...form, isActive: e.target.value === 'true'})} style={inpStyle}>
                    <option value="true">نشط</option>
                    <option value="false">غير نشط</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={lblStyle}>الوصف</label>
                <input type="text" value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})} style={inpStyle} />
              </div>

              <div style={{ marginTop: "1rem", border: "1px solid #eee", padding: "1rem", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem" }}>المنتجات المشمولة بالعرض</h3>
                  <button type="button" onClick={addItem} style={{ background: "#f3f4f6", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>+ إضافة منتج</button>
                </div>
                
                {form.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
                    <select 
                      value={item.productId} 
                      onChange={e => updateItem(i, "productId", e.target.value)}
                      style={{ ...inpStyle, flex: 3 }}
                    >
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input 
                      type="number" min="1" placeholder="الكمية" 
                      value={item.quantity} 
                      onChange={e => updateItem(i, "quantity", e.target.value)}
                      style={{ ...inpStyle, flex: 1 }}
                    />
                    <button type="button" onClick={() => removeItem(i)} style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", padding: "0.5rem", cursor: "pointer" }}>✕</button>
                  </div>
                ))}
                {form.items.length === 0 && <p style={{ fontSize: "0.9rem", color: "#888", textAlign: "center" }}>لم يتم إضافة منتجات بعد</p>}
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
