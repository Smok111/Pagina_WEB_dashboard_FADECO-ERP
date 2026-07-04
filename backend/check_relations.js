const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.producto.findFirst({
    where: { nombre: 'aewgfawhg' },
    include: {
      detallesCompra: true,
      detallesVenta: true,
      ordenesProduccion: true,
      consumosMateriaPrima: true,
      kardexProduccion: true
    }
  });
  console.log(JSON.stringify(p, null, 2));
}
main().finally(() => prisma.$disconnect());
