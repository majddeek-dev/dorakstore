"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const statCards = [
  { key: "todayRevenue", label: "إيرادات اليوم", icon: "💰", fmt: v => `${v.toFixed(2)} ₪`, color: "#10b981" },
  { key: "pendingOrders", label: "طلبات قيد المعالجة", icon: "⏳", fmt: v => v, color: "#f59e0b" },
  { key: "totalProducts", label: "إجمالي المنتجات", icon: "📦", fmt: v => v, color: "#6366f1" },
  { key: "totalCustomers", label: "العملاء الفريدون", icon: "👥", fmt: v => v, color: "#3b82f6" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/orders').then(r => r.json()),
    ]).then(([s, o]) => {
      setStats(s);
      setOrders(o.slice(0, 8));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const cfg = {
      "مكتمل": { bg: "#d1fae5", color: "#065f46" },
      "ملغي":  { bg: "#fee2e2", color: "#991b1b" },
    };
    const { bg, color } = cfg[status] || { bg: "#fef3c7", color: "#92400e" };
    return (
      <span style={{ background: bg, color, padding: "3px 10px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700 }}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#111", margin: 0 }}>لوحة القيادة</h1>
          <p style={{ color: "#888", marginTop: "0.25rem", fontSize: "0.9rem" }}>مرحباً! هنا نظرة عامة على متجرك.</p>
        </div>
        <Link href="/shop" target="_blank" style={{ background: "#111", color: "#fff", padding: "0.6rem 1.2rem", borderRadius: "8px", fontSize: "0.9rem", fontWeight: 600 }}>
          🛍️ عرض المتجر
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        {statCards.map(sc => (
          <div key={sc.key} style={{
            background: "#fff", padding: "1.5rem", borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            borderTop: `4px solid ${sc.color}`,
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{sc.icon}</div>
            <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "0.3rem" }}>{sc.label}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#111" }}>
              {loading ? "—" : stats ? sc.fmt(stats[sc.key] ?? 0) : "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders table */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#111" }}>أحدث الطلبات</h2>
          <Link href="/admin/orders" style={{ fontSize: "0.85rem", color: "#6366f1", fontWeight: 600 }}>عرض الكل ←</Link>
        </div>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#999" }}>جاري التحميل...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
              <thead>
                <tr style={{ background: "#fafafa", color: "#888", fontSize: "0.85rem" }}>
                  <th style={{ padding: "0.9rem 1.2rem" }}>رقم الطلب</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>العميل</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>التاريخ</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>الإجمالي</th>
                  <th style={{ padding: "0.9rem 1.2rem" }}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderTop: "1px solid #f0f0f0", color: "#333" }}>
                    <td style={{ padding: "0.9rem 1.2rem", fontWeight: 700, color: "#6366f1" }}>#{o.id.slice(-6).toUpperCase()}</td>
                    <td style={{ padding: "0.9rem 1.2rem" }}>
                      <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                      <div style={{ fontSize: "0.8rem", color: "#999" }}>{o.customerPhone}</div>
                    </td>
                    <td style={{ padding: "0.9rem 1.2rem", fontSize: "0.88rem", color: "#666" }}>
                      {new Date(o.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td style={{ padding: "0.9rem 1.2rem", fontWeight: 700 }}>{o.total.toFixed(2)} ₪</td>
                    <td style={{ padding: "0.9rem 1.2rem" }}>{statusBadge(o.status)}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#bbb" }}>لا توجد طلبات بعد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
