"use client";
import { useState, useEffect, useCallback } from "react";

const STATUSES = ["قيد المعالجة", "تم الشحن", "مكتمل", "ملغي"];

const STATUS_STYLE = {
  "مكتمل":        { bg: "#d1fae5", color: "#065f46" },
  "ملغي":         { bg: "#fee2e2", color: "#991b1b" },
  "تم الشحن":    { bg: "#dbeafe", color: "#1e40af" },
  "قيد المعالجة": { bg: "#fef3c7", color: "#92400e" },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("الكل");
  const [drawer, setDrawer] = useState(null); // selected order for detail
  const [updatingId, setUpdatingId] = useState(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/orders")
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function flash(text) { setMsg(text); setTimeout(() => setMsg(""), 3000); }

  async function updateStatus(orderId, newStatus) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (drawer?.id === orderId) setDrawer(prev => ({ ...prev, status: newStatus }));
        flash("✅ تم تحديث حالة الطلب");
      }
    } finally { setUpdatingId(null); }
  }

  const statusBadge = (status) => {
    const { bg, color } = STATUS_STYLE[status] || { bg: "#f3f4f6", color: "#555" };
    return <span style={{ background: bg, color, padding: "3px 10px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap" }}>{status}</span>;
  };

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === "الكل" || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !search || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q) || o.id.includes(q);
    return matchStatus && matchSearch;
  });

  const summary = STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#111", margin: 0 }}>إدارة الطلبات</h1>
          <p style={{ color: "#888", fontSize: "0.9rem", margin: "0.2rem 0 0" }}>{orders.length} طلب إجمالاً</p>
        </div>
      </div>

      {msg && <div style={{ background: "#d1fae5", color: "#065f46", padding: "0.75rem 1.2rem", borderRadius: "8px", marginBottom: "1rem", fontWeight: 600, fontSize: "0.95rem" }}>{msg}</div>}

      {/* Status counters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {["الكل", ...STATUSES].map(s => {
          const count = s === "الكل" ? orders.length : summary[s];
          const active = filterStatus === s;
          return (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: "0.45rem 1rem", borderRadius: "20px", border: "1px solid",
              borderColor: active ? "#6366f1" : "#e5e7eb",
              background: active ? "#6366f1" : "#fff",
              color: active ? "#fff" : "#555",
              fontWeight: active ? 700 : 500, cursor: "pointer",
              fontSize: "0.85rem", fontFamily: "'Tajawal', sans-serif",
              transition: "all 0.2s",
            }}>
              {s} {count !== undefined && <span style={{ opacity: 0.8 }}>({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ marginBottom: "1.5rem" }}>
        <input type="text" placeholder="🔍 ابحث باسم العميل أو رقم الطلب..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: "0.75rem 1rem", border: "1px solid #e5e7eb", borderRadius: "8px", width: "100%", maxWidth: "420px", fontSize: "0.95rem", fontFamily: "'Tajawal', sans-serif", outline: "none" }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#999" }}>جاري التحميل...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", minWidth: "750px" }}>
              <thead>
                <tr style={{ background: "#fafafa", color: "#888", fontSize: "0.85rem" }}>
                  <th style={{ padding: "0.9rem 1.2rem" }}>رقم الطلب</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>العميل</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>التاريخ</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>الإجمالي</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>الحالة</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>تغيير الحالة</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>تفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} style={{ borderTop: "1px solid #f0f0f0", color: "#333" }}>
                    <td style={{ padding: "0.9rem 1.2rem", fontWeight: 700, color: "#6366f1", fontSize: "0.9rem" }}>
                      #{o.id.slice(-6).toUpperCase()}
                    </td>
                    <td style={{ padding: "0.9rem 1.2rem" }}>
                      <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                      <div style={{ fontSize: "0.8rem", color: "#999" }}>{o.customerPhone}</div>
                    </td>
                    <td style={{ padding: "0.9rem 1.2rem", fontSize: "0.85rem", color: "#666" }}>
                      {new Date(o.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td style={{ padding: "0.9rem 1.2rem", fontWeight: 700 }}>{o.total.toFixed(2)} ₪</td>
                    <td style={{ padding: "0.9rem 1.2rem" }}>{statusBadge(o.status)}</td>
                    <td style={{ padding: "0.9rem 1.2rem" }}>
                      <select
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={e => updateStatus(o.id, e.target.value)}
                        style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "0.85rem", fontFamily: "'Tajawal', sans-serif", cursor: "pointer", background: "#fafafa" }}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "0.9rem 1.2rem" }}>
                      <button onClick={() => setDrawer(o)}
                        style={{ background: "#f3f4f6", color: "#374151", border: "none", padding: "0.4rem 0.9rem", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontFamily: "'Tajawal', sans-serif", fontSize: "0.82rem" }}>
                        عرض
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: "2.5rem", textAlign: "center", color: "#bbb" }}>لا توجد طلبات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {drawer && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.4)" }} onClick={() => setDrawer(null)} />
          <div style={{ width: "420px", maxWidth: "95vw", background: "#fff", height: "100vh", overflowY: "auto", direction: "rtl", padding: "2rem", boxShadow: "-4px 0 20px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
                تفاصيل الطلب <span style={{ color: "#6366f1" }}>#{drawer.id.slice(-6).toUpperCase()}</span>
              </h2>
              <button onClick={() => setDrawer(null)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#888" }}>✕</button>
            </div>

            {/* Status */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "0.5rem", fontWeight: 600 }}>الحالة الحالية</div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                {statusBadge(drawer.status)}
                <select value={drawer.status} disabled={updatingId === drawer.id}
                  onChange={e => updateStatus(drawer.id, e.target.value)}
                  style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "0.85rem", fontFamily: "'Tajawal', sans-serif", cursor: "pointer" }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Customer info */}
            <InfoBlock title="بيانات الزبون" rows={[
              ["الاسم", drawer.customerName],
              ["الهاتف", drawer.customerPhone],
              ["المنطقة", drawer.region],
              ["العنوان", drawer.address],
              ["طريقة الدفع", drawer.paymentMethod],
              ["تاريخ الطلب", new Date(drawer.createdAt).toLocaleString('ar-EG')],
            ]} />

            {/* Items */}
            {drawer.items && drawer.items.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.85rem", color: "#888", fontWeight: 600, marginBottom: "0.75rem" }}>المنتجات</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {drawer.items.map(item => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", background: "#fafafa", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.9rem" }}>
                      <span style={{ fontWeight: 600 }}>{item.product?.name || "منتج محذوف"}</span>
                      <span style={{ color: "#888" }}>× {item.quantity}</span>
                      <span style={{ fontWeight: 700 }}>{(item.price * item.quantity).toFixed(2)} ₪</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            <div style={{ background: "#f9fafb", padding: "1rem 1.2rem", borderRadius: "8px", display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.1rem" }}>
              <span>الإجمالي</span>
              <span style={{ color: "#059669" }}>{drawer.total.toFixed(2)} ₪</span>
            </div>

            {/* WhatsApp */}
            <a href={`https://wa.me/${drawer.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً ${drawer.customerName}، بخصوص طلبك رقم #${drawer.id.slice(-6).toUpperCase()}`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: "block", marginTop: "1.5rem", textAlign: "center", background: "#25d366", color: "#fff", padding: "0.85rem", borderRadius: "10px", fontWeight: 700, fontSize: "0.95rem" }}>
              📱 تواصل عبر واتساب
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ title, rows }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ fontSize: "0.85rem", color: "#888", fontWeight: 600, marginBottom: "0.5rem" }}>{title}</div>
      <div style={{ background: "#fafafa", borderRadius: "8px", padding: "0.75rem 1rem" }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.45rem 0", borderBottom: "1px solid #f0f0f0", fontSize: "0.9rem", gap: "1rem" }}>
            <span style={{ color: "#888", flexShrink: 0 }}>{label}</span>
            <span style={{ fontWeight: 600, textAlign: "left" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
