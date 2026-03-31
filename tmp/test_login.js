const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.admin.findMany();
  console.log('--- ADMINS IN DB ---');
  for (const admin of admins) {
    console.log(`Username: ${admin.username}, HasHash: ${!!admin.passwordHash}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
