const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const stocks = await prisma.stockAlmacen.findMany({
    include: {
      producto: true,
      almacen: true
    }
  });
  console.log("Stocks:", JSON.stringify(stocks, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
