"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const EMPTY_FORM = { name: "", categoryId: "", price: "", costPrice: "", oldPrice: "", badge: "", desc: "", stock: "", imageUrl: "", isActive: true, publishAt: "" };

function SortableItem({ id, p, getCatName, openEdit, handleDelete, deleteId, toggleActive }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    borderTop: "1px solid #f0f0f0", 
    color: "#333",
    background: isDragging ? "#f9fafb" : "transparent"
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td style={{ padding: "0.9rem 0.5rem", cursor: "grab", textAlign: "center" }} {...attributes} {...listeners}>
        <span style={{ color: "#aaa" }}>☰</span>
      </td>
      <td style={{ padding: "0.9rem 1.2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "40px", height: "40px", background: "#f3f4f6", borderRadius: "4px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {p.imageUrl ? <img src={p.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={p.name} /> : "📦"}
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
        <button 
          onClick={() => toggleActive(p)}
          style={{ 
            background: p.isActive ? "#d1fae5" : "#fee2e2", 
            color: p.isActive ? "#065f46" : "#991b1b",
            border: "none", padding: "3px 10px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" 
          }}
        >
          {p.isActive ? "نشط" : "معطّل"}
        </button>
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
  );
}

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/products?admin=true"), // fetch all even inactive
        fetch("/api/admin/categories")
      ]);
      const [pData, cData] = await Promise.all([pRes.json(), cRes.json()]);
      
      // Sort client-side by sortOrder if available
      const sortedProducts = (Array.isArray(pData) ? pData : []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      
      setProducts(sortedProducts);
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
      isActive: p.isActive, 
      publishAt: p.publishAt ? new Date(p.publishAt).toISOString().slice(0, 16) : ""
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
        category: selectedCat ? selectedCat.name : "Uncategorized", 
        price: parseFloat(form.price),
        costPrice: parseFloat(form.costPrice || "0"),
        oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
        badge: form.badge || null,
        desc: form.desc || null,
        stock: parseInt(form.stock || "0"),
        imageUrl: form.imageUrl || null,
        isActive: form.isActive,
        publishAt: form.publishAt ? new Date(form.publishAt).toISOString() : null
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

  async function toggleActive(p) {
    try {
      const res = await fetch(`/api/products/${p.id}`, { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ isActive: !p.isActive }) 
      });
      if (res.ok) { 
        setProducts(products.map(item => item.id === p.id ? { ...item, isActive: !p.isActive } : item));
        flash(`✅ تم ${!p.isActive ? "تفعيل" : "تعطيل"} المنتج`); 
      }
    } catch(e) {
      alert("حدث خطأ");
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setProducts((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update sortOrder on the backend
        const payload = newItems.map((item, index) => ({ id: item.id, sortOrder: index }));
        fetch('/api/admin/products/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(r => {
          if(r.ok) flash("✅ تم تحديث ترتيب المنتجات");
        });

        return newItems;
      });
    }
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
          <p style={{ color: "#888", fontSize: "0.9rem", margin: "0.2rem 0 0" }}>{products.length} منتج في المتجر (يمكنك سحب المنتج لترتيبه)</p>
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

      {/* Table with DnD */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#999" }}>جاري التحميل...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", minWidth: "700px" }}>
                <thead>
                  <tr style={{ background: "#fafafa", color: "#888", fontSize: "0.85rem" }}>
                    <th style={{ padding: "0.9rem 0.5rem", width: "30px" }}>↕</th>
                    <th style={{ padding: "0.9rem 1.2rem" }}>المنتج</th>
                    <th style={{ padding: "0.9rem 1.2rem" }}>الفئة</th>
                    <th style={{ padding: "0.9rem 1.2rem" }}>السعر</th>
                    <th style={{ padding: "0.9rem 1.2rem" }}>المخزون</th>
                    <th style={{ padding: "0.9rem 1.2rem" }}>الحالة</th>
                    <th style={{ padding: "0.9rem 1.2rem" }}>الإجراءات</th>
                  </tr>
                </thead>
                <SortableContext items={filtered.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <tbody>
                    {filtered.map(p => (
                      <SortableItem key={p.id} id={p.id} p={p} getCatName={getCatName} openEdit={openEdit} handleDelete={handleDelete} deleteId={deleteId} toggleActive={toggleActive} />
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: "2.5rem", textAlign: "center", color: "#bbb" }}>لا توجد منتجات</td></tr>
                    )}
                  </tbody>
                </SortableContext>
              </table>
            </DndContext>
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
                    <img src={form.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="preview" />
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

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={lblClass}>حالة المنتج</label>
                  <select value={form.isActive} onChange={e => setForm(prev => ({ ...prev, isActive: e.target.value === 'true' }))} style={inpClass}>
                    <option value="true">نشط (يظهر في المتجر)</option>
                    <option value="false">مسودّة (مخفي)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={lblClass}>موعد النشر (اختياري)</label>
                  <input type="datetime-local" value={form.publishAt} onChange={e => setForm({...form, publishAt: e.target.value})} style={inpClass} />
                </div>
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
                  <label style={lblClass}>{f.label}</label>
                  <input
                    type={f.type || "text"} required={f.required}
                    value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={inpClass}
                    placeholder={f.key === "imageUrl" ? "أو ضع رابطاً مباشراً هنا" : ""}
                  />
                </div>
              ))}
              <div>
                <label style={lblClass}>الفئة *</label>
                <select required value={form.categoryId} onChange={e => setForm(prev => ({ ...prev, categoryId: e.target.value }))} style={inpClass}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  {categories.length === 0 && <option value="">لا يوجد فئات - أضف واحدة أولاً</option>}
                </select>
              </div>
              <div>
                <label style={lblClass}>الوصف</label>
                <textarea value={form.desc} onChange={e => setForm(prev => ({ ...prev, desc: e.target.value }))} rows={3} style={{ ...inpClass, resize: "vertical" }} />
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

const lblClass = { display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.9rem", color: "#555" };
const inpClass = { width: "100%", padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "0.95rem", fontFamily: "'Tajawal', sans-serif", boxSizing: "border-box" };

function btnStyle(bg) {
  return { background: bg, color: "#fff", border: "none", padding: "0.65rem 1.3rem", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "'Tajawal', sans-serif", fontSize: "0.95rem", transition: "opacity 0.2s" };
}
function btnSmall(bg) {
  return { background: bg, color: "#fff", border: "none", padding: "0.4rem 0.9rem", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontFamily: "'Tajawal', sans-serif", fontSize: "0.82rem" };
}
