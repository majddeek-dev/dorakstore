import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.section}>
          <div className={styles.logoWrap}>
            <Image
              src="/logo.png"
              alt="Dorak Store"
              width={100}
              height={50}
              style={{ width: 'auto', height: '50px', objectFit: 'contain' }}
            />
            <h3 className={styles.title}>Dorak Store</h3>
          </div>
          <p className={styles.desc}>
            وجهتك الأولى للتسوق في فلسطين. نقدم أفضل العطور، الساعات، النظارات، والحقائب.
          </p>
        </div>

        <div className={styles.section}>
          <h4 className={styles.subtitle}>روابط مهمة</h4>
          <ul className={styles.list}>
            <li><Link href="/about">من نحن</Link></li>
            <li><Link href="/contact">اتصل بنا</Link></li>
            <li><Link href="/faq">الأسئلة الشائعة</Link></li>
          </ul>
        </div>

        <div className={styles.section}>
          <h4 className={styles.subtitle}>السياسات</h4>
          <ul className={styles.list}>
            <li><Link href="/return-policy">سياسة الإرجاع</Link></li>
            <li><Link href="/shipping-policy">سياسة الشحن</Link></li>
          </ul>
        </div>

        <div className={styles.section}>
          <h4 className={styles.subtitle}>تابعنا</h4>
          <div className={styles.socials}>
            <a href="https://www.instagram.com/dk07_store/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.tiktok.com/@dk07.store" target="_blank" rel="noopener noreferrer">TikTok</a>
            <a href="https://www.facebook.com/profile.php?id=61588502249480&locale=ar_AR" target="_blank" rel="noopener noreferrer">Facebook</a>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} Dorak Store. جميع الحقوق محفوظة.</p>
        <p>
          برمجة و تطوير بواسطة <a href="https://www.instagram.com/majd_deek.16/">مجد الديك</a>
        </p>
      </div>
    </footer>
  );
}
