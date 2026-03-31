"use client";
import { useState, useEffect, useCallback } from "react";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return !search || 
           c.name.toLowerCase().includes(q) || 
           c.phone?.includes(q) || 
           c.email?.toLowerCase().includes(q) || 
           c.region?.toLowerCase().includes(q);
  });

  const stats = [
    { label: "إجمالي الزبائن", value: customers.length, icon: "👥", color: "#6366f1" },
    { label: "الأعضاء المسجلين", value: customers.filter(c => c.type === 'member').length, icon: "👤", color: "#10b981" },
    { label: "الضيوف", value: customers.filter(c => c.type === 'guest').length, icon: "🛍️", color: "#f59e0b" },
    { label: "إجمالي الإنفاق", value: `${customers.reduce((s, c) => s + c.totalSpent, 0).toFixed(0)} ₪`, icon: "💰", color: "#3b82f6" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#111", margin: 0 }}>إدارة العملاء</h1>
          <p style={{ color: "#888", fontSize: "0.9rem", margin: "0.2rem 0 0" }}>لمحة عامة عن جميع الزيارات والطلبات.</p>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "#fff", padding: "1.2rem", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>{s.icon}</div>
            <div style={{ fontSize: "0.8rem", color: "#888" }}>{s.label}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#111" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: "1.5rem" }}>
        <input type="text" placeholder="🔍 ابحث بالاسم، الهاتف، البريد أو المنطقة..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: "0.75rem 1rem", border: "1px solid #e5e7eb", borderRadius: "8px", width: "100%", maxWidth: "450px", fontSize: "0.95rem", fontFamily: "'Tajawal', sans-serif", outline: "none" }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#999" }}>جاري التحميل...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", minWidth: "800px" }}>
              <thead>
                <tr style={{ background: "#fafafa", color: "#888", fontSize: "0.85rem" }}>
                  <th style={{ padding: "0.9rem 1.2rem" }}>الاسم</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>النوع</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>بيانات التواصل</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>المنطقة</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>الطلبات</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>إجمالي الإنفاق</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>آخر نشاط</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>تواصل</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id || c.phone} style={{ borderTop: "1px solid #f0f0f0", color: "#333" }}>
                    <td style={{ padding: "0.9rem 1.2rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{
                          width: "38px", height: "38px", borderRadius: "50%",
                          background: c.type === 'member' ? '#e0e7ff' : '#f3f4f6',
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 800, fontSize: "0.95rem", color: c.type === 'member' ? '#4338ca' : '#666', flexShrink: 0,
                        }}>
                          {c.name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{c.name}</div>
                          {c.type === 'member' && <div style={{ fontSize: "0.75rem", color: "#6366f1", fontWeight: 600 }}>حساب مسجل</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "0.9rem 1.2rem" }}>
                      <span style={{ 
                        background: c.type === 'member' ? "#dcfce7" : "#f1f5f9", 
                        color: c.type === 'member' ? "#166534" : "#475569", 
                        padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700 
                      }}>
                        {c.type === 'member' ? "👤 عضو مفعّل" : "🛍️ ضيف"}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1.2rem" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{c.phone || "—"}</div>
                      <div style={{ fontSize: "0.78rem", color: "#999" }}>{c.email}</div>
                    </td>
                    <td style={{ padding: "0.9rem 1.2rem" }}>
                      <span style={{ fontSize: "0.85rem", color: "#666" }}>{c.region}</span>
                    </td>
                    <td style={{ padding: "0.9rem 1.2rem" }}>
                      <span style={{ fontWeight: 700, color: c.orderCount >= 3 ? "#6366f1" : "#333" }}>{c.orderCount} طلب</span>
                    </td>
                    <td style={{ padding: "0.9rem 1.2rem", fontWeight: 700, color: "#10b981" }}>{c.totalSpent.toFixed(2)} ₪</td>
                    <td style={{ padding: "0.9rem 1.2rem", fontSize: "0.85rem", color: "#999" }}>
                      {new Date(c.lastOrder).toLocaleDateString('ar-EG')}
                    </td>
                    <td style={{ padding: "0.9rem 1.2rem" }}>
                      <a
                        href={`https://wa.me/${c.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً ${c.name}، نتواصل معك من DK7 Store 🛍️`)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#25d366", color: "#fff", padding: "0.4rem 0.9rem", borderRadius: "8px", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none" }}
                      >
                        📱 واتساب
                      </a>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "#bbb" }}>
                    {loading ? "جاري التحميل..." : "لا توجد نتائج مطابقة لبحثك"}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
