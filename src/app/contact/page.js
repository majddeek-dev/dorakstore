"use client";
import React from 'react';

export default function ContactPage() {
  const whatsappUrl = `https://wa.me/+970569749171?text=${encodeURIComponent("مرحباً Dorak Store، لدي استفسار بخصوص المتجر.")}`;

  return (
    <div style={{ direction: 'rtl', fontFamily: "'Tajawal', sans-serif", padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--foreground)' }}>تواصل معنا 📞</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--foreground)', opacity: 0.8, maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
          نحن دائماً هنا لمساعدتك! سواء كان لديك استفسار عن منتج، أو تود تتبع طلبك، فريقنا جاهز للرد عليك في أسرع وقت.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
        {/* Contact Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[
            { t: "عبر الواتساب", v: "+970 56-974-9171", i: "📱", c: "#25d366", link: whatsappUrl },
          ].map((item, idx) => (
            <a
              key={idx}
              href={item.link || '#'}
              target={item.link?.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '1.5rem',
                padding: '1.5rem', background: '#fff', borderRadius: '20px',
                boxShadow: idx === 0 ? '0 15px 35px rgba(37,211,102,0.15)' : '0 10px 30px rgba(0,0,0,0.03)',
                border: idx === 0 ? '2px solid rgba(37,211,102,0.3)' : '1px solid #f0f0f0',
                textDecoration: 'none', color: 'inherit',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '60px', height: '60px', background: item.c, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '15px', fontSize: '1.8rem'
              }}>
                {item.i}
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.2rem' }}>{item.t}</h4>
                <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111' }}>{item.v}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Support Message Card */}
        <div style={{
          background: '#fafafa', padding: '3rem', borderRadius: '30px',
          textAlign: 'center', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', border: '1px solid #f0f0f0',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Subtle Glow */}
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />

          <h2 style={{ color: '#000000ff', fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem' }}>هل تحتاج لمساعدة فورية؟</h2>
          <p style={{ color: '#555', marginBottom: '2.5rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
            فريق الدعم الفني متواجد طوال أيام الأسبوع على مدار الساعة لخدمتكم.
          </p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            padding: '1.2rem 2.5rem', background: '#25d366', color: '#fff',
            borderRadius: '50px', fontWeight: 800, fontSize: '1.2rem',
            textDecoration: 'none', boxShadow: '0 10px 30px rgba(37,211,102,0.3)'
          }}>
            تحدث معنا الآن عبر واتساب 💬
          </a>
          <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#aaa' }}>
            نقوم عادةً بالرد خلال أقل من 15 دقيقة 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
