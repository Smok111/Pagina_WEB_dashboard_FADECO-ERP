const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const id = 11;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.stockAlmacen.deleteMany({ where: { productoId: id } });
      await tx.movimientoInventario.deleteMany({ where: { productoId: id } });
      await tx.producto.delete({ where: { id } });
    });
    console.log("SUCCESS!");
  } catch (error) {
    console.error("ERROR DELETING:", error);
  }
}
main().finally(() => prisma.$disconnect());
