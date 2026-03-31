const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
  if (match) process.env.DATABASE_URL = match[1];
}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: { url: process.env.DATABASE_URL }
    }
});

async function main() {
  console.log('🌱 Seeding discounts settings...');
  await prisma.globalSetting.upsert({
    where: { key: 'member_discount_percent' },
    update: {},
    create: {
      key: 'member_discount_percent',
      value: '10' // Default 10%
    }
  });

  await prisma.globalSetting.upsert({
    where: { key: 'flash_sale_enabled' },
    update: {},
    create: {
      key: 'flash_sale_enabled',
      value: 'true'
    }
  });

  await prisma.globalSetting.upsert({
    where: { key: 'flash_sale_product_id' },
    update: {},
    create: {
      key: 'flash_sale_product_id',
      value: '' // Empty by default (will use automatic if empty or hide if disabled)
    }
  });
  console.log('✅ Default member discount set to 10%');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
