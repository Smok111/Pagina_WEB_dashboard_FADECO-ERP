const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.producto.findFirst({
    where: { nombre: 'moladora angular de 7' },
    include: {
      ordenesProduccion: true
    }
  });
  console.log(JSON.stringify(p, null, 2));
}
main().finally(() => prisma.$disconnect());
