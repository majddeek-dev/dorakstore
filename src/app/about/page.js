"use client";
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div style={{ direction: 'rtl', fontFamily: "'Tajawal', sans-serif" }}>
      {/* Hero Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1594132225292-a13ea2186985?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        textAlign: 'center',
        color: '#fff'
      }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem' }}>قصة DK7 Store</h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
          نحن هنا لنقدم للشباب الفلسطيني أرقى العطور، الساعات، والإكسسوارات التي تعبر عن شخصيتهم الفريدة.
        </p>
      </section>

      {/* Content Section */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', color: '#111' }}>رؤيتنا</h2>
            <p style={{ color: '#555', lineHeight: 1.8, fontSize: '1.1rem' }}>
              بدأ Dorak Store كحلم بسيط في قلب فلسطين، لتمكين الشباب من الحصول على منتجات عالمية بجودة عالية وأسعار منافسة. نحن نؤمن أن الأناقة ليست مجرد مظهر، بل هي تعبير عن الهوية والكبرياء.
            </p>
            <p style={{ color: '#555', lineHeight: 1.8, fontSize: '1.1rem', marginTop: '1rem' }}>
              كل منتج في متجرنا يتم اختياره بعناية فائقة لنضمن لك تجربة تسوق استثنائية، بدءاً من جودة الخامة وصولاً إلى سرعة التوصيل لباب بيتك.
            </p>
          </div>
          <div style={{
            background: '#fafafa',
            padding: '3rem',
            borderRadius: '30px',
            border: '2px dashed #eee',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🇵🇸</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111' }}>بكل فخر من فلسطين</h3>
            <p style={{ color: '#888', marginTop: '0.5rem' }}>نشحن لكافة مناطق الضفة، القدس، ومناطق الـ 48</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 2rem', background: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '3rem' }}>لماذا تسوق من DK7؟</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {[
              { t: "أصالة المنتجات", d: "نضمن لك أن جميع عطورنا وساعاتنا أصلية 100% بنسبة ثبات عالية.", i: "💎" },
              { t: "توصيل سريع", d: "شعارنا السرعة، نصلك أينما كنت في وقت قياسي.", i: "⚡" },
              { t: "الدفع عند الاستلام", d: "تسوق بكل راحة وأمان، وادفع فقط عند معاينة طلبك.", i: "💳" }
            ].map(f => (
              <div key={f.t} style={{ background: '#fff', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{f.i}</div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>{f.t}</h4>
                <p style={{ color: '#666', lineHeight: 1.6 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem' }}>جاهز لتعزيز أناقتك؟</h2>
        <Link href="/shop" style={{
          display: 'inline-block',
          padding: '1.2rem 3.5rem',
          background: '#111',
          color: '#fff',
          borderRadius: '50px',
          fontWeight: 800,
          fontSize: '1.2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          تصفح المتجر الآن 🛍️
        </Link>
      </section>
    </div>
  );
}
