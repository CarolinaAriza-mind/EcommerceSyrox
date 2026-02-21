import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('admin123', 10);

  await prisma.admin.upsert({
    where: { email: 'admin@syrox.com' },
    update: {},
    create: {
      email: 'admin@syrox.com',
      password: hashed,
      name: 'Administrador',
    },
  });

  console.log('✅ Admin creado: admin@syrox.com / admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
