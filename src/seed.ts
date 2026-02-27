import { PrismaClient, Role, Status } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPERADMIN_EMAIL || 'superadmin@gmail.com';
  const password = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123';

  // Warn if using default credentials in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SUPERADMIN_EMAIL || !process.env.SUPERADMIN_PASSWORD) {
      throw new Error(
        '🚨 SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set in production!'
      );
    }
  }

  const hash = await bcrypt.hash(password, 10);

  const superadmin = await prisma.user.upsert({
    where: { email },
    update: {
      role: Role.SUPERADMIN,
      password: hash,
      status: Status.active,
    },
    create: {
      first_name: 'Super',
      last_name: 'Admin',
      email,
      password: hash,
      role:Role.SUPERADMIN,
      status: Status.active,
      phone:"885157525",
      address:'Toshkent'
    },
  });

  console.log(`✅ Superadmin ready: ${superadmin.email} (ID: ${superadmin.id})`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });