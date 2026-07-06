const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const almacenes = await prisma.almacen.findMany();
  console.log("Almacenes:", almacenes);
}

main().catch(console.error).finally(() => prisma.$disconnect());
