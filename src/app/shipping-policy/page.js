export const metadata = { title: "سياسة الشحن | DK7 Store" };

export default function ShippingPolicyPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 2rem", minHeight: "60vh", lineHeight: "1.8" }}>
      <h1 style={{ marginBottom: "2rem", fontSize: "2.5rem", textAlign: "center" }}>سياسة الشحن والتوصيل</h1>
      <p>نوفر خدمة التوصيل لجميع مناطق الضفة الغربية، القدس، ومناطق الـ 48.</p>
      <ul style={{ paddingRight: "2rem", marginTop: "1rem" }}>
        <li>الضفة الغربية: 20 شيكل (24 ساعة)</li>
        <li>القدس: 30 شيكل (24 ساعة)</li>
        <li>مناطق 48: 70 شيكل (24 ساعة)</li>
      </ul>
    </div>
  );
}
