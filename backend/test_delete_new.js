const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.producto.create({
    data: {
      codigoSistema: 'PRO-TEST',
      codigo: 'PRO-TEST',
      nombre: 'Test Delete Product',
      categoriaId: 1,
      unidadMedidaId: 1,
      stockActual: 10,
      estado: true
    }
  });
  console.log("Created product ID:", p.id);
  
  try {
    await prisma.$transaction(async (tx) => {
      await tx.stockAlmacen.deleteMany({ where: { productoId: p.id } });
      await tx.movimientoInventario.deleteMany({ where: { productoId: p.id } });
      await tx.producto.delete({ where: { id: p.id } });
    });
    console.log("DELETED SUCCESSFULLY!");
  } catch(e) {
    console.error("FAILED TO DELETE:", e);
  }
}
main().finally(() => prisma.$disconnect());
