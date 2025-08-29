import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@system.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@system.com',
      password: hashedPassword,
      rol: 'ADMIN',  // 👈 asegúrate que tu modelo Usuario tenga un campo rol
    },
  });

  console.log('Usuario admin creado:', admin);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
