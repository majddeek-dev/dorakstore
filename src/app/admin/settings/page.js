"use client";
import { useState, useEffect } from "react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    ENABLE_FREE_SHIPPING: "false",
    FREE_SHIPPING_THRESHOLD: "500",
    member_discount_percent: "0",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({ ...prev, ...data }));
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? "true" : "false") : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Save all settings one by one
      for (const key of Object.keys(settings)) {
        await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value: String(settings[key]) })
        });
      }
      alert('تم حفظ الإعدادات بنجاح!');
    } catch (err) {
      alert('خطأ أثناء حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "#999" }}>جاري التحميل...</div>;

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "1.5rem" }}>إعدادات المتجر</h1>
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: "2rem", maxWidth: "600px" }}>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div style={{ padding: "1.5rem", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#111", fontSize: "1.1rem" }}>🚚 إعدادات الشحن المجاني</h3>
            
            <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input 
                type="checkbox" 
                id="ENABLE_FREE_SHIPPING" 
                name="ENABLE_FREE_SHIPPING"
                checked={settings.ENABLE_FREE_SHIPPING === "true"}
                onChange={handleChange}
                style={{ width: "18px", height: "18px" }}
              />
              <label htmlFor="ENABLE_FREE_SHIPPING" style={{ fontWeight: 600, cursor: "pointer" }}>تفعيل الشحن المجاني التلقائي</label>
            </div>

            {settings.ENABLE_FREE_SHIPPING === "true" && (
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.9rem", color: "#555" }}>
                  الحد الأدنى لقيمة المشتريات (₪)
                </label>
                <input 
                  type="number" 
                  name="FREE_SHIPPING_THRESHOLD"
                  value={settings.FREE_SHIPPING_THRESHOLD} 
                  onChange={handleChange} 
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "0.95rem" }} 
                  required
                />
              </div>
            )}
          </div>

          <div style={{ padding: "1.5rem", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#111", fontSize: "1.1rem" }}>👥 إعدادات الأعضاء</h3>
            
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.9rem", color: "#555" }}>
                نسبة الخصم التلقائي للأعضاء المسجلين (%)
              </label>
              <input 
                type="number" 
                name="member_discount_percent"
                value={settings.member_discount_percent} 
                onChange={handleChange} 
                style={{ width: "100%", padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "0.95rem" }} 
                required
              />
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ background: "#111", color: "#fff", border: "none", padding: "0.85rem", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "1rem" }}>
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </form>
      </div>
    </div>
  );
}
