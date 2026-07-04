const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const id = 10;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.stockAlmacen.deleteMany({ where: { productoId: id } });
      await tx.movimientoInventario.deleteMany({ where: { productoId: id } });
      await tx.producto.delete({ where: { id } });
    });
    console.log("DELETED SUCCESSFULLY");
  } catch (error) {
    console.error("ERROR DELETING:", error.code, error.meta, error.message);
  }
}
main().finally(() => prisma.$disconnect());
