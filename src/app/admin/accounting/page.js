"use client";
import { useState, useEffect, useCallback } from "react";

const CATEGORIES = ["تسويق", "شحن", "بضاعة", "إيجار", "رواتب", "أخرى"];

export default function AccountingDashboard() {
  const [stats, setStats] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingExpense, setAddingExpense] = useState(false);
  const [newExp, setNewExp] = useState({ description: "", amount: "", category: "أخرى", date: new Date().toISOString().split('T')[0] });
  const [msg, setMsg] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, eRes] = await Promise.all([
        fetch('/api/admin/accounting').then(r => r.json()),
        fetch('/api/admin/expenses').then(r => r.json())
      ]);
      setStats(sRes);
      setExpenses(eRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 3000); };

  async function handleAddExpense(e) {
    e.preventDefault();
    setAddingExpense(true);
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExp)
      });
      if (res.ok) {
        flash("✅ تمت إضافة المصروف بنجاح");
        setNewExp({ description: "", amount: "", category: "أخرى", date: new Date().toISOString().split('T')[0] });
        loadData();
      }
    } finally {
      setAddingExpense(false);
    }
  }

  async function handleDeleteExpense(id) {
    if (!confirm("هل أنت متأكد من حذف هذا المصروف؟")) return;
    const res = await fetch(`/api/admin/expenses/${id}`, { method: 'DELETE' });
    if (res.ok) {
      flash("🗑️ تم حذف المصروف");
      loadData();
    }
  }

  if (loading) return <div style={{ padding: "4rem", textAlign: "center", color: "#888" }}>جاري تحميل البيانات المالية...</div>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#111", margin: 0 }}>نظام الحسابات</h1>
        <p style={{ color: "#888", marginTop: "0.5rem" }}>إدارة التكاليف والأرباح والمصاريف لمتجر DK7.</p>
      </div>

      {msg && (
        <div style={{ background: "#d1fae5", color: "#065f46", padding: "1rem", borderRadius: "10px", marginBottom: "1.5rem", fontWeight: 600 }}>
          {msg}
        </div>
      )}

      {/* Financial Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <StatCard label="إجمالي الإيرادات" value={stats?.totalRevenue} icon="💰" color="#10b981" subtitle={`${stats?.orderCount} طلب مكتمل`} />
        <StatCard label="تكلفة البضاعة" value={stats?.totalCOGS} icon="📦" color="#6366f1" subtitle="إجمالي تكلفة المشتريات" />
        <StatCard label="إجمالي المصاريف" value={stats?.totalExpenses} icon="📉" color="#f59e0b" subtitle={`من أصل ${stats?.expenseCount} من البنود`} />
        <StatCard label="صافي الربح" value={stats?.netProfit} icon="🚀" color={stats?.netProfit >= 0 ? "#059669" : "#dc2626"} subtitle={`هامش الربح: ${stats?.margin.toFixed(1)}%`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "2.5rem", alignItems: "start" }}>
        {/* Add Expense Form */}
        <section style={{ background: "#fff", padding: "2rem", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>إضافة مصروف جديد</h2>
          <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <Field label="بيان المصروف" id="desc">
              <input type="text" value={newExp.description} onChange={e => setNewExp({...newExp, description: e.target.value})} placeholder="مثال: إعلانات فيسبوك" required 
                style={inputStyle} />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Field label="المبلغ (₪)" id="amt">
                <input type="number" step="0.01" value={newExp.amount} onChange={e => setNewExp({...newExp, amount: e.target.value})} placeholder="0.00" required 
                  style={inputStyle} />
              </Field>
              <Field label="الفئة" id="cat">
                <select value={newExp.category} onChange={e => setNewExp({...newExp, category: e.target.value})} style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <Field label="التاريخ" id="date">
              <input type="date" value={newExp.date} onChange={e => setNewExp({...newExp, date: e.target.value})} style={inputStyle} />
            </Field>
            <button type="submit" disabled={addingExpense} style={{
              background: "#111", color: "#fff", padding: "0.9rem", borderRadius: "10px", 
              fontWeight: 700, border: "none", cursor: "pointer", fontSize: "1rem", marginTop: "0.5rem"
            }}>
              {addingExpense ? "جاري الإضافة..." : "حفظ المصروف"}
            </button>
          </form>
        </section>

        {/* Expenses List */}
        <section style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #f0f0f0" }}>
            <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>سجل المصاريف</h2>
          </div>
          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
              <thead style={{ background: "#fafafa", position: "sticky", top: 0 }}>
                <tr>
                  <th style={thStyle}>البيان</th>
                  <th style={thStyle}>الفئة</th>
                  <th style={thStyle}>التاريخ</th>
                  <th style={thStyle}>المبلغ</th>
                  <th style={thStyle}>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={tdStyle}>{e.description}</td>
                    <td style={tdStyle}><span style={{ background: "#f3f4f6", padding: "3px 8px", borderRadius: "6px", fontSize: "0.8rem" }}>{e.category}</span></td>
                    <td style={{ ...tdStyle, color: "#888", fontSize: "0.85rem" }}>{new Date(e.date).toLocaleDateString('ar-EG')}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{e.amount.toFixed(2)} ₪</td>
                    <td style={tdStyle}>
                      <button onClick={() => handleDeleteExpense(e.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: 600 }}>حذف</button>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#bbb" }}>لا توجد مصاريف مسجلة</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, subtitle }) {
  return (
    <div style={{ 
      background: "#fff", padding: "1.5rem", borderRadius: "16px", 
      boxShadow: "0 4px 15px rgba(0,0,0,0.03)", borderTop: `5px solid ${color}` 
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <span style={{ fontSize: "1.8rem" }}>{icon}</span>
        <span style={{ color: "#888", fontSize: "0.85rem", fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#111", marginBottom: "0.25rem" }}>
        {value?.toFixed(2) || "0.00"} ₪
      </div>
      <div style={{ fontSize: "0.8rem", color: "#999" }}>{subtitle}</div>
    </div>
  );
}

function Field({ label, id, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label htmlFor={id} style={{ fontSize: "0.85rem", fontWeight: 600, color: "#666" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  padding: "0.8rem",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
  fontSize: "0.95rem",
  fontFamily: "inherit",
  outline: "none",
  background: "#f9fafb"
};

const thStyle = { padding: "1rem 1.5rem", fontSize: "0.85rem", color: "#888", fontWeight: 600 };
const tdStyle = { padding: "1rem 1.5rem", fontSize: "0.9rem" };
