const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  // Seed Products
  const products = [
    { name: "عطر ليالي الشرق للرجال", category: "perfumes-men", price: 120, oldPrice: 150, badge: "جديد", stock: 15, desc: "عطر شرقي فاخر يدوم طويلاً" },
    { name: "عطر زهور الربيع للنساء", category: "perfumes-women", price: 140, stock: 20, desc: "عطر زهري منعش للصيف" },
    { name: "ساعة كلاسيك سوار معدني", category: "watches", price: 250, badge: "خصم 20%", stock: 4, desc: "ساعة أنيقة مناسبة لجميع الأوقات" },
    { name: "نظارة شمسية صيفية", category: "sunglasses", price: 85, oldPrice: 100, stock: 32, desc: "حماية كاملة من أشعة الشمس" },
    { name: "حقيبة ظهر جلد طبيعي", category: "bags", price: 320, stock: 10, desc: "حقيبة ظهر عملية متينة" },
    { name: "طقم إكسسوارات نسائي", category: "accessories", price: 65, stock: 50, desc: "طقم متكامل لإطلالة جذابة" }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: '0' },
      update: {},
      create: p,
    }).catch(() => prisma.product.create({ data: p }));
  }

  // Seed Admin Account
  const ADMIN_USERNAME = 'mdorak';
  const ADMIN_PASSWORD = 'DK7@admin2026';

  const existing = await prisma.admin.findUnique({ where: { username: ADMIN_USERNAME } });
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  
  if (!existing) {
    await prisma.admin.create({
      data: { username: ADMIN_USERNAME, passwordHash }
    });
    console.log(`✅ Admin account created: username="${ADMIN_USERNAME}" password="${ADMIN_PASSWORD}"`);
  } else {
    await prisma.admin.update({
      where: { username: ADMIN_USERNAME },
      data: { passwordHash }
    });
    console.log(`ℹ️  Admin account password updated: "${ADMIN_USERNAME}"`);
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
