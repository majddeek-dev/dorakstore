import styles from "./Features.module.css";

export default function Features() {
  const features = [
    { title: "الدفع عند الاستلام", desc: "ادفع براحة عند استلام طلبك", icon: "💰" },
    { title: "توصيل سريع", desc: "توصيل لكافة مناطق فلسطين والـ 48", icon: "🚚" },
    { title: "جودة أصلية", desc: "منتجات أصلية ومضمونة 100%", icon: "⭐" },
    { title: "خدمة عملاء", desc: "دعم متواصل للإجابة على استفساراتكم", icon: "💬" }
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {features.map((f, i) => (
          <div key={i} className={styles.feature}>
            <div className={styles.icon}>{f.icon}</div>
            <h3 className={styles.title}>{f.title}</h3>
            <p className={styles.desc}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
