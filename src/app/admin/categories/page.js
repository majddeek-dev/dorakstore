"use client";
import { useState, useEffect, useCallback } from "react";

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "add" | "edit"
  const [form, setForm] = useState({ id: "", name: "", imageUrl: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [showHomeCategories, setShowHomeCategories] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCats(Array.isArray(data) ? data : []);

      const setRes = await fetch("/api/admin/settings");
      const setData = await setRes.json();
      if (setData.showHomeCategories !== undefined) {
        setShowHomeCategories(setData.showHomeCategories === "true");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 3000); };

  async function toggleHomeCategories() {
    const newValue = !showHomeCategories;
    setShowHomeCategories(newValue); // Optimistic UI update
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "showHomeCategories", value: newValue.toString() })
      });
      flash(newValue ? "👁️ تم إظهار الفئات في الشاشة الرئيسية" : "👁️‍🗨️ تم إخفاء الفئات من الشاشة الرئيسية");
    } catch (e) {
      alert("حدث خطأ أثناء حفظ الإعدادات");
      setShowHomeCategories(!newValue);
    }
  }

  function openAdd() { setForm({ id: "", name: "", imageUrl: "" }); setModal("add"); }
  function openEdit(c) { setForm({ id: c.id, name: c.name, imageUrl: c.imageUrl || "" }); setModal("edit"); }
  function closeModal() { setModal(null); setForm({ id: "", name: "", imageUrl: "" }); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = modal === "edit" ? `/api/admin/categories/${form.id}` : "/api/admin/categories";
      const method = modal === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, imageUrl: form.imageUrl }),
      });
      if (res.ok) {
        closeModal();
        load();
        flash(modal === "edit" ? "✅ تم التعديل" : "✅ تمت الإضافة");
      } else {
        const err = await res.json();
        alert(err.error || "خطأ ما");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("هل أنت متأكد من حذف هذه الفئة؟ سيؤثر هذا على المنتجات المرتبطة بها.")) return;
    try {
      await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      load();
      flash("🗑️ تم الحذف");
    } catch { }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>إدارة الفئات</h1>
          <p style={{ color: "#888" }}>إجمالي الفئات: {cats.length}</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button
            onClick={toggleHomeCategories}
            style={{ ...btnStyle(showHomeCategories ? "#dc2626" : "#10b981"), display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            {showHomeCategories ? "إخفاء الفئات من الرئيسية 👁️‍🗨️" : "إظهار الفئات في الرئيسية 👁️"}
          </button>
          <button onClick={openAdd} style={btnStyle("#111")}>+ إضافة فئة جديدة</button>
        </div>
      </div>

      {msg && <div style={{ background: "#d1fae5", color: "#065f46", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>{msg}</div>}

      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>جاري التحميل...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", direction: "rtl" }}>
            <thead>
              <tr style={{ background: "#fafafa", color: "#888", fontSize: "0.9rem" }}>
                <th style={{ padding: "1rem" }}>الصورة</th>
                <th style={{ padding: "1rem" }}>اسم الفئة</th>
                <th style={{ padding: "1rem" }}>تاريخ الإنشاء</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {cats.map(c => (
                <tr key={c.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: "1rem" }}>
                    {c.imageUrl ? <img src={c.imageUrl} alt={c.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8 }} /> : "✨"}
                  </td>
                  <td style={{ padding: "1rem", fontWeight: 700 }}>{c.name}</td>
                  <td style={{ padding: "1rem", color: "#888" }}>{new Date(c.createdAt).toLocaleDateString("ar-EG")}</td>
                  <td style={{ padding: "1rem", textAlign: "left" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button onClick={() => openEdit(c)} style={btnSmall("#6366f1")}>تعديل</button>
                      <button onClick={() => handleDelete(c.id)} style={btnSmall("#dc2626")}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
              {cats.length === 0 && (
                <tr><td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: "#ccc" }}>لا يوجد فئات مضافة</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "400px", direction: "rtl" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>{modal === "add" ? "إضافة فئة" : "تعديل الفئة"}</h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>اسم الفئة</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  autoFocus
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid #ddd", borderRadius: "8px", fontFamily: "inherit" }}
                  placeholder="مثال: عطور صيفية"
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>رابط الصورة (اختياري)</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid #ddd", borderRadius: "8px", fontFamily: "inherit", textAlign: "left", direction: "ltr" }}
                  placeholder="https://..."
                />
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button type="submit" disabled={saving} style={{ ...btnStyle("#111"), flex: 1 }}>
                  {saving ? "جاري الحفظ..." : "حفظ"}
                </button>
                <button type="button" onClick={closeModal} style={{ ...btnStyle("#999"), flex: 1 }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function btnStyle(bg) {
  return { background: bg, color: "#fff", border: "none", padding: "0.75rem 1.5rem", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" };
}
function btnSmall(bg) {
  return { background: bg, color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", fontFamily: "inherit" };
}
