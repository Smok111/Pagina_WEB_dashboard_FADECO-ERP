import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Limpiando datos de prueba...');
  
  await prisma.movimientoCaja.deleteMany();
  await prisma.kardexProduccion.deleteMany();
  await prisma.ordenProduccionTrabajador.deleteMany();
  await prisma.consumoMateriaPrima.deleteMany();
  await prisma.lote.deleteMany();
  await prisma.estadoProduccion.deleteMany();
  await prisma.controlCalidad.deleteMany();
  await prisma.incidenciaProduccion.deleteMany();
  await prisma.ordenProduccion.deleteMany();
  
  await prisma.detalleVenta.deleteMany();
  await prisma.venta.deleteMany();
  
  await prisma.detalleCompra.deleteMany();
  await prisma.compra.deleteMany();
  
  await prisma.stockAlmacen.deleteMany();
  await prisma.producto.deleteMany();
  
  await prisma.asistencia.deleteMany();
  await prisma.vacaciones.deleteMany();
  await prisma.trabajador.deleteMany();
  
  console.log('Datos de prueba eliminados exitosamente. Tu base de datos está lista para producción real.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
