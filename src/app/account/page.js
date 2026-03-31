"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("login"); // "login" | "register"
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) {
          setSession(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleAuth(e) {
    e.preventDefault();
    setError("");
    setFetching(true);
    const endpoint = view === "login" ? "/api/auth/login" : "/api/auth/register";
    
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        if (view === "login") {
          window.location.reload(); // Simple session refresh
        } else {
          setView("login");
          alert("تم إنشاء الحساب بنجاح، يمكنك الآن تسجيل الدخول");
        }
      } else {
        setError(data.error || "فشلت العملية");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setFetching(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  }

  if (loading) return <div style={centerStyle}>جاري التحميل...</div>;

  if (session) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "4rem 2rem", direction: "rtl", fontFamily: "'Tajawal', sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>مرحباً، {session.user.name} 👋</h1>
            <p style={{ color: "#666", marginTop: "0.5rem" }}>أهلاً بك في حسابك الشخصي بمتجر DK7.</p>
          </div>
          <button onClick={handleLogout} style={{ border: "1px solid #ddd", background: "none", padding: "0.6rem 1.2rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>تسجيل الخروج</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2.5rem" }}>
          {/* Profile Card */}
          <aside>
            <div style={{ background: "#fff", border: "1px solid #eee", padding: "2rem", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <h3 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>المعلومات الشخصية</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <InfoItem label="الاسم" value={session.user.name} />
                <InfoItem label="البريد" value={session.user.email} />
                <InfoItem label="الهاتف" value={session.user.phone || "—"} />
                <InfoItem label="عضو منذ" value={new Date(session.user.createdAt).toLocaleDateString('ar-EG')} />
              </div>
            </div>
          </aside>

          {/* Orders */}
          <main>
            <h3 style={{ marginBottom: "1.5rem" }}>تاريخ الطلبات ({session.orders.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              {session.orders.length === 0 ? (
                <div style={{ padding: "4rem", textAlign: "center", background: "#fafafa", borderRadius: "16px", color: "#999" }}>لا يوجد لديك طلبات سابقة بعد.</div>
              ) : (
                session.orders.map(o => <OrderCard key={o.id} order={o} />)
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", direction: "rtl", fontFamily: "'Tajawal', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "420px", background: "#fff", border: "1px solid #eee", padding: "3rem", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.5rem" }}>{view === "login" ? "تسجيل الدخول" : "إنشاء حساب الجديد"}</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "2rem" }}>{view === "login" ? "أهلاً بك مجدداً في متجرنا الرقمي" : "انضم ليتم تتبع طلباتك بكل سهولة"}</p>
        
        {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "0.8rem", borderRadius: "8px", fontSize: "0.9rem", marginBottom: "1.5rem", textAlign: "center" }}>{error}</div>}

        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {view === "register" && (
            <input type="text" placeholder="الاسم الكامل" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
          )}
          <input type="email" placeholder="البريد الإلكتروني" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
          {view === "register" && (
             <input type="tel" placeholder="رقم الهاتف (اختياري)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
          )}
          <input type="password" placeholder="كلمة المرور" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={inputStyle} />
          
          <button type="submit" disabled={fetching} style={{ background: "#111", color: "#fff", padding: "1rem", borderRadius: "10px", fontSize: "1rem", fontWeight: 700, border: "none", cursor: "pointer", marginTop: "0.5rem" }}>
            {fetching ? "جاري المعالجة..." : view === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.9rem", color: "#666" }}>
          {view === "login" ? (
            <>ليس لديك حساب؟ <span onClick={() => setView("register")} style={{ color: "#111", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>أنشئ حساباً الآن</span></>
          ) : (
            <>لديك حساب بالفعل؟ <span onClick={() => setView("login")} style={{ color: "#111", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>سجل دخولك</span></>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={{ borderBottom: "1px solid #f5f5f5", paddingBottom: "0.75rem" }}>
      <label style={{ fontSize: "0.8rem", color: "#999", display: "block", marginBottom: "0.2rem" }}>{label}</label>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function OrderCard({ order }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #eee", padding: "1.5rem", borderRadius: "16px", transition: "transform 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <span style={{ fontWeight: 800, color: "#111" }}>طلب #{order.id.slice(-6).toUpperCase()}</span>
          <div style={{ fontSize: "0.85rem", color: "#999", marginTop: "0.2rem" }}>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</div>
        </div>
        <span style={{ background: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700 }}>{order.status}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        {order.items.map(item => (
          <div key={item.id} style={{ fontSize: "0.85rem", background: "#f9fafb", padding: "0.4rem 0.8rem", borderRadius: "6px" }}>
            {item.product?.name} <span style={{ color: "#aaa" }}>×{item.quantity}</span>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "left", fontSize: "1.1rem", fontWeight: 800, color: "#10b981" }}>{order.total.toFixed(2)} ₪</div>
    </div>
  );
}

const centerStyle = { minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#888" };
const inputStyle = { padding: "0.9rem", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s" };
