const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const prods = await prisma.producto.findMany({ include: { StockAlmacen: true } });
  console.log(JSON.stringify(prods.filter(p => p.nombre.includes('Ladrillo King Kong')), null, 2));
}
main().finally(() => prisma.$disconnect());
