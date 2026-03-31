"use client";
import { useState } from "react";
import Link from "next/link";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    // Clean order ID: remove # and trim
    const cleanId = orderId.replace("#", "").trim();

    try {
      const res = await fetch(`/api/orders/${cleanId}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        setError("لم نجد هذا الطلب. تأكد من إدخال الرقم بشكل صحيح.");
      }
    } catch {
      setError("حدث خطأ في الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  const statusStyle = (status) => {
    switch(status) {
      case "مكتمل": return { bg: "#d1fae5", color: "#065f46" };
      case "ملغي": return { bg: "#fee2e2", color: "#991b1b" };
      case "تم الشحن": return { bg: "#dbeafe", color: "#1e40af" };
      default: return { bg: "#fef3c7", color: "#92400e" };
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "4rem 2rem", minHeight: "70vh", textAlign: "right", direction: "rtl", fontFamily: "'Tajawal', sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem", color: "#111" }}>تتبع طلبك 📦</h1>
        <p style={{ color: "#666", fontSize: "1.1rem" }}>أدخل رقم الطلب الخاص بك لمعرفة حالته وتفاصيله</p>
      </div>
      
      <form onSubmit={handleTrack} style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
        <input 
          type="text" 
          placeholder="رقم الطلب (مثال: #abc123)" 
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
          required
          style={{ padding: "1.2rem", border: "2px solid #eee", borderRadius: "12px", minWidth: "300px", flex: 1, fontSize: "1.1rem", outline: "none", transition: "border-color 0.2s" }}
          onFocus={e => e.target.style.borderColor = "#111"}
          onBlur={e => e.target.style.borderColor = "#eee"}
        />
        <button 
          disabled={loading}
          style={{ padding: "1.2rem 3rem", background: "#111", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "bold", fontSize: "1.1rem", cursor: "pointer", transition: "transform 0.2s" }}
          onMouseEnter={e => e.target.style.transform = "scale(1.02)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}
        >
          {loading ? "جاري البحث..." : "تتبع"}
        </button>
      </form>

      {error && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "1rem 1.5rem", borderRadius: "8px", fontWeight: "bold", textAlign: "center", border: "1px solid #fecaca" }}>⚠️ {error}</div>}

      {result && (
        <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0", overflow: "hidden", animation: "fadeIn 0.5s ease" }}>
          <div style={{ padding: "2rem", borderBottom: "1px solid #f0f0f0", background: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.9rem", color: "#888", marginBottom: "0.2rem" }}>حالة الطلب:</div>
              <span style={{ 
                padding: "0.5rem 1.2rem", 
                borderRadius: "30px", 
                fontWeight: 800, 
                fontSize: "1rem", 
                ...statusStyle(result.status)
              }}>
                {result.status}
              </span>
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "0.9rem", color: "#888", marginBottom: "0.2rem" }}>رقم الطلب:</div>
              <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#111" }}>#{result.id.slice(-6).toUpperCase()}</div>
            </div>
          </div>

          <div style={{ padding: "2rem" }}>
            <h3 style={{ marginBottom: "1.5rem", fontSize: "1.2rem", fontWeight: 700 }}>تفاصيل التوصيل</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
              <div>
                <span style={{ display: "block", color: "#888", fontSize: "0.85rem", marginBottom: "0.3rem" }}>الاسم:</span>
                <span style={{ fontWeight: 700 }}>{result.customerName}</span>
              </div>
              <div>
                <span style={{ display: "block", color: "#888", fontSize: "0.85rem", marginBottom: "0.3rem" }}>المنطقة:</span>
                <span style={{ fontWeight: 700 }}>{result.region}</span>
              </div>
              <div>
                <span style={{ display: "block", color: "#888", fontSize: "0.85rem", marginBottom: "0.3rem" }}>العنوان:</span>
                <span style={{ fontWeight: 700 }}>{result.address}</span>
              </div>
              <div>
                <span style={{ display: "block", color: "#888", fontSize: "0.85rem", marginBottom: "0.3rem" }}>تاريخ الطلب:</span>
                <span style={{ fontWeight: 700 }}>{new Date(result.createdAt).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>

            <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem", fontWeight: 700 }}>المنتجات</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
              {result.items.map(item => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f9fafb", padding: "1rem", borderRadius: "12px" }}>
                  <span style={{ fontWeight: 600 }}>{item.product?.name || "منتج"}</span>
                  <div>
                    <span style={{ color: "#888", fontSize: "0.9rem", marginLeft: "1rem" }}>{item.quantity} × {item.price} ₪</span>
                    <span style={{ fontWeight: 700 }}>{item.quantity * item.price} ₪</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #eee", paddingTop: "1.5rem" }}>
              <span style={{ fontSize: "1.2rem", fontWeight: 700 }}>الإجمالي:</span>
              <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "#111" }}>{result.total.toFixed(2)} ₪</span>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
