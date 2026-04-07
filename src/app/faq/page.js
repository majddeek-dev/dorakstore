export const metadata = { title: "الأسئلة الشائعة | DK7 Store" };

export default function FAQPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 2rem", minHeight: "60vh" }}>
      <h1 style={{ marginBottom: "2rem", fontSize: "2.5rem", textAlign: "center" }}>الأسئلة الشائعة</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ background: "#f5f5f5", padding: "1.5rem", borderRadius: "8px" }}>
          <h3 style={{ color: '#3a3a3aff', marginBottom: "0.5rem" }}>كم تستغرق عملية التوصيل؟</h3>
          <p style={{ color: '#3a3a3aff', }}>تستغرق عملية التوصيل عادةً 24 ساعة كحد اقصى في الضفة الغربية،مناطق الـ 48 والقدس.</p>
        </div>
        <div style={{ background: "#f5f5f5", padding: "1.5rem", borderRadius: "8px" }}>
          <h3 style={{ color: '#3a3a3aff', marginBottom: "0.5rem" }}>هل المنتجات أصلية؟</h3>
          <p style={{ color: '#3a3a3aff', }}>نعم، جميع منتجاتنا أصلية ومضمونة 100%.</p>
        </div>
      </div>
    </div>
  );
}
