const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const username = 'mdorak';
  const password = 'DK7@admin2026';

  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) {
    console.log('Admin not found');
    return;
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  console.log(`Login test for ${username}: ${isValid ? 'SUCCESS' : 'FAILED'}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
