"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const EMPTY_FORM = { name: "", categoryId: "", price: "", costPrice: "", oldPrice: "", badge: "", desc: "", stock: "", imageUrl: "" };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "add" | "edit"
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");
  const fileInputRef = useRef(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/admin/categories")
      ]);
      const [pData, cData] = await Promise.all([pRes.json(), cRes.json()]);
      
      setProducts(Array.isArray(pData) ? pData : []);
      setCategories(Array.isArray(cData) ? cData : []);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function openAdd() { 
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id || "" }); 
    setModal("add"); 
  }
  
  function openEdit(p) {
    setForm({
      id: p.id, name: p.name, categoryId: p.categoryId || "",
      price: String(p.price), costPrice: String(p.costPrice || "0"), oldPrice: p.oldPrice ? String(p.oldPrice) : "",
      badge: p.badge || "", desc: p.desc || "",
      stock: String(p.stock), imageUrl: p.imageUrl || "",
    });
    setModal("edit");
  }
  
  function closeModal() { setModal(null); setForm(EMPTY_FORM); }

  function flash(text) { setMsg(text); setTimeout(() => setMsg(""), 3000); }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setForm(prev => ({ ...prev, imageUrl: data.url }));
        flash("✅ تمت عملية الرفع بنجاح");
      } else {
        alert("فشل الرفع: " + data.error);
      }
    } catch (err) {
      alert("خطأ في الاتصال بالخادم أثناء الرفع");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const selectedCat = categories.find(c => c.id === form.categoryId);
      const payload = {
        name: form.name, 
        categoryId: form.categoryId,
        category: selectedCat ? selectedCat.name : "Uncategorized", // Fallback for backward compatibility
        price: parseFloat(form.price),
        costPrice: parseFloat(form.costPrice || "0"),
        oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
        badge: form.badge || null,
        desc: form.desc || null,
        stock: parseInt(form.stock || "0"),
        imageUrl: form.imageUrl || null,
      };
      const url = modal === "edit" ? `/api/products/${form.id}` : "/api/products";
      const method = modal === "edit" ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        closeModal();
        loadData();
        flash(modal === "edit" ? "✅ تم تحديث المنتج" : "✅ تمت إضافة المنتج");
      } else {
        const err = await res.json();
        alert("خطأ: " + (err.error || "Unknown"));
      }
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    setDeleteId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) { loadData(); flash("🗑️ تم حذف المنتج"); }
    } finally { setDeleteId(null); }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  const getCatName = p => {
    const found = categories.find(c => c.id === p.categoryId);
    return found ? found.name : p.category || "—";
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#111", margin: 0 }}>إدارة المخزون</h1>
          <p style={{ color: "#888", fontSize: "0.9rem", margin: "0.2rem 0 0" }}>{products.length} منتج في المتجر</p>
        </div>
        <button onClick={openAdd} style={btnStyle("#111")}>+ إضافة منتج جديد</button>
      </div>

      {msg && <div style={{ background: "#d1fae5", color: "#065f46", padding: "0.75rem 1.2rem", borderRadius: "8px", marginBottom: "1rem", fontWeight: 600, fontSize: "0.95rem" }}>{msg}</div>}

      {/* Search */}
      <div style={{ marginBottom: "1.5rem" }}>
        <input
          type="text" placeholder="🔍 ابحث عن منتج..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: "0.75rem 1rem", border: "1px solid #e5e7eb", borderRadius: "8px", width: "100%", maxWidth: "380px", fontSize: "0.95rem", fontFamily: "'Tajawal', sans-serif", outline: "none" }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#999" }}>جاري التحميل...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", minWidth: "700px" }}>
              <thead>
                <tr style={{ background: "#fafafa", color: "#888", fontSize: "0.85rem" }}>
                  <th style={{ padding: "0.9rem 1.2rem" }}>المنتج</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>الفئة</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>السعر</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>المخزون</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>الشارة</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} style={{ borderTop: "1px solid #f0f0f0", color: "#333" }}>
                    <td style={{ padding: "0.9rem 1.2rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "40px", height: "40px", background: "#f3f4f6", borderRadius: "4px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {p.imageUrl ? <img src={p.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "📦"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{p.name}</div>
                          {p.desc && <div style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "2px", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.desc}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "0.9rem 1.2rem" }}>
                      <span style={{ background: "#f3f4f6", padding: "3px 10px", borderRadius: "20px", fontSize: "0.82rem" }}>{getCatName(p)}</span>
                    </td>
                    <td style={{ padding: "0.9rem 1.2rem" }}>
                      <span style={{ fontWeight: 700 }}>{p.price} ₪</span>
                      {p.oldPrice && <span style={{ marginRight: "6px", color: "#aaa", textDecoration: "line-through", fontSize: "0.85rem" }}>{p.oldPrice} ₪</span>}
                    </td>
                    <td style={{ padding: "0.9rem 1.2rem" }}>
                      <span style={{ fontWeight: 700, color: p.stock === 0 ? "#dc2626" : p.stock <= 5 ? "#d97706" : "#059669" }}>
                        {p.stock === 0 ? "نفد" : p.stock}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1.2rem" }}>
                      {p.badge ? <span style={{ background: "#f3f4f6", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem" }}>{p.badge}</span> : <span style={{ color: "#ddd" }}>—</span>}
                    </td>
                    <td style={{ padding: "0.9rem 1.2rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => openEdit(p)} style={btnSmall("#6366f1")}>تعديل</button>
                        <button onClick={() => handleDelete(p.id)} disabled={deleteId === p.id} style={btnSmall("#dc2626")}>
                          {deleteId === p.id ? "..." : "حذف"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: "2.5rem", textAlign: "center", color: "#bbb" }}>لا توجد منتجات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "540px", maxHeight: "90vh", overflowY: "auto", direction: "rtl" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800 }}>{modal === "add" ? "إضافة منتج جديد" : "تعديل المنتج"}</h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#888" }}>✕</button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Image Upload Area */}
              <div style={{ marginBottom: "1rem", textAlign: "center" }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem", fontSize: "0.9rem", color: "#555" }}>صورة المنتج</label>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  style={{ 
                    width: "120px", height: "120px", background: "#f9fafb", border: "2px dashed #ddd", 
                    borderRadius: "12px", margin: "0 auto", cursor: "pointer", overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center", position: "relative"
                  }}
                >
                  {form.imageUrl ? (
                    <img src={form.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "2rem", opacity: 0.3 }}>{uploading ? "⏳" : "📷"}</span>
                  )}
                  {uploading && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700 }}>جاري الرفع...</div>}
                </div>
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />
                <button type="button" onClick={() => fileInputRef.current.click()} style={{ background: "none", border: "none", color: "#6366f1", fontSize: "0.85rem", fontWeight: 700, marginTop: "0.5rem", cursor: "pointer" }}>
                  {form.imageUrl ? "تغيير الصورة" : "اضغط لرفع صورة"}
                </button>
              </div>

              {[
                { label: "اسم المنتج *", key: "name", required: true },
                { label: "سعر البيع (₪) *", key: "price", type: "number", required: true },
                { label: "سعر التكلفة (₪) *", key: "costPrice", type: "number", required: true },
                { label: "السعر القديم (₪)", key: "oldPrice", type: "number" },
                { label: "الكمية في المخزون *", key: "stock", type: "number", required: true },
                { label: "شارة (مثال: جديد، خصم)", key: "badge" },
                { label: "رابط الصورة (اختياري)", key: "imageUrl" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.9rem", color: "#555" }}>{f.label}</label>
                  <input
                    type={f.type || "text"} required={f.required}
                    value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "0.95rem", fontFamily: "'Tajawal', sans-serif", boxSizing: "border-box" }}
                    placeholder={f.key === "imageUrl" ? "أو ضع رابطاً مباشراً هنا" : ""}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.9rem", color: "#555" }}>الفئة *</label>
                <select required value={form.categoryId} onChange={e => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "0.95rem", fontFamily: "'Tajawal', sans-serif" }}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  {categories.length === 0 && <option value="">لا يوجد فئات - أضف واحدة أولاً</option>}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.9rem", color: "#555" }}>الوصف</label>
                <textarea value={form.desc} onChange={e => setForm(prev => ({ ...prev, desc: e.target.value }))} rows={3}
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "0.95rem", fontFamily: "'Tajawal', sans-serif", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="submit" disabled={saving || uploading} style={{ ...btnStyle("#111"), flex: 1, padding: "0.85rem", fontSize: "1rem" }}>
                  {saving ? "جاري الحفظ..." : modal === "add" ? "إضافة المنتج" : "حفظ التعديلات"}
                </button>
                <button type="button" onClick={closeModal} style={{ ...btnStyle("#9ca3af"), flex: 1, padding: "0.85rem", fontSize: "1rem" }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function btnStyle(bg) {
  return { background: bg, color: "#fff", border: "none", padding: "0.65rem 1.3rem", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "'Tajawal', sans-serif", fontSize: "0.95rem", transition: "opacity 0.2s" };
}
function btnSmall(bg) {
  return { background: bg, color: "#fff", border: "none", padding: "0.4rem 0.9rem", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontFamily: "'Tajawal', sans-serif", fontSize: "0.82rem" };
}
