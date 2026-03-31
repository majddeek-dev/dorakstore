"use client";
import Link from "next/link";

export default function CheckoutSuccess() {
  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "3rem 2rem",
      fontFamily: "'Tajawal', sans-serif",
    }}>
      <div style={{
        width: "90px", height: "90px",
        background: "linear-gradient(135deg, #10b981, #059669)",
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "2.5rem",
        marginBottom: "1.5rem",
        boxShadow: "0 8px 32px rgba(16,185,129,0.3)",
      }}>
        ✅
      </div>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.75rem", color: "#111" }}>
        تم تأكيد طلبك بنجاح!
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#555", maxWidth: "450px", lineHeight: 1.6, marginBottom: "2rem" }}>
        شكراً لك! سيتم التواصل معك قريباً لتأكيد التوصيل. الدفع عند الاستلام.
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/shop" style={{
          background: "#111", color: "#fff",
          padding: "0.9rem 2rem", borderRadius: "8px",
          fontWeight: 700, fontSize: "1rem",
        }}>
          متابعة التسوق
        </Link>
        <Link href="/track-order" style={{
          background: "#fff", color: "#111",
          padding: "0.9rem 2rem", borderRadius: "8px",
          fontWeight: 700, fontSize: "1rem",
          border: "1px solid #111",
        }}>
          تتبع الطلب
        </Link>
      </div>
    </div>
  );
}
