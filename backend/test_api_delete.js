const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.producto.create({
    data: {
      codigoSistema: 'PRO-TEST-100',
      codigo: 'PRO-TEST-100',
      nombre: 'Test API Delete 100',
      categoriaId: 1,
      unidadMedidaId: 1,
      stockActual: 5,
      estado: true,
      StockAlmacen: {
        create: {
          almacenId: 1,
          stockActual: 5
        }
      },
      MovimientoInventario: {
        create: {
          almacenId: 1,
          tipo: 'INGRESO',
          cantidad: 5,
          observacion: 'Inventario inicial'
        }
      }
    }
  });
  console.log("Created ID:", p.id);
  
  try {
    await prisma.$transaction(async (tx) => {
      await tx.stockAlmacen.deleteMany({ where: { productoId: p.id } });
      await tx.movimientoInventario.deleteMany({ where: { productoId: p.id } });
      await tx.producto.delete({ where: { id: p.id } });
    });
    console.log("SIMULATED API DELETED SUCCESSFULLY");
  } catch (error) {
    console.error("SIMULATED API FAILED:", error);
  }
}
main().finally(() => prisma.$disconnect());
