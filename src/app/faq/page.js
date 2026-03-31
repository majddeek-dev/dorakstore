export const metadata = { title: "الأسئلة الشائعة | DK7 Store" };

export default function FAQPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 2rem", minHeight: "60vh" }}>
      <h1 style={{ marginBottom: "2rem", fontSize: "2.5rem", textAlign: "center" }}>الأسئلة الشائعة</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ background: "#f5f5f5", padding: "1.5rem", borderRadius: "8px" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>كم تستغرق عملية التوصيل؟</h3>
          <p>تستغرق عملية التوصيل عادةً بين 2-4 أيام عمل في الضفة الغربية، وحتى أسبوع لمناطق الـ 48 والقدس.</p>
        </div>
        <div style={{ background: "#f5f5f5", padding: "1.5rem", borderRadius: "8px" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>هل المنتجات أصلية؟</h3>
          <p>نعم، جميع منتجاتنا أصلية ومضمونة 100%.</p>
        </div>
      </div>
    </div>
  );
}
