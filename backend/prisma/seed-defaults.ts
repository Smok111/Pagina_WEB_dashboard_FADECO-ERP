import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Categorias
  const categorias = [
    { codigo: 'CAT-001', nombre: 'Materia Prima', descripcion: 'Insumos básicos para producción' },
    { codigo: 'CAT-002', nombre: 'Producto Terminado', descripcion: 'Productos listos para la venta' },
    { codigo: 'CAT-003', nombre: 'Herramientas', descripcion: 'Herramientas de uso en planta' },
    { codigo: 'CAT-004', nombre: 'Repuestos', descripcion: 'Repuestos para maquinaria' },
    { codigo: 'CAT-005', nombre: 'EPP', descripcion: 'Equipos de Protección Personal' },
  ];

  for (const cat of categorias) {
    await prisma.categoria.upsert({
      where: { nombre: cat.nombre },
      update: {},
      create: cat,
    });
  }

  // Unidades de Medida
  const unidades = [
    { codigo: 'UND-001', nombre: 'Unidad' },
    { codigo: 'UND-002', nombre: 'Kilogramo' },
    { codigo: 'UND-003', nombre: 'Metro' },
    { codigo: 'UND-004', nombre: 'Metro Cuadrado' },
    { codigo: 'UND-005', nombre: 'Litro' },
    { codigo: 'UND-006', nombre: 'Galón' },
    { codigo: 'UND-007', nombre: 'Caja' },
    { codigo: 'UND-008', nombre: 'Saco' },
  ];

  for (const und of unidades) {
    await prisma.unidadMedida.upsert({
      where: { codigo: und.codigo },
      update: {},
      create: und,
    });
  }

  // Almacen Central
  await prisma.almacen.upsert({
    where: { codigo: 'ALM-001' },
    update: {},
    create: {
      codigo: 'ALM-001',
      nombre: 'Almacén Central',
      ubicacion: 'Planta Principal',
    },
  });

  // Areas y Cargos por defecto para que funcione el import
  const areas = ['Administración', 'Ventas', 'Logística', 'Producción'];
  for (const a of areas) {
    await prisma.area.upsert({
      where: { nombre: a },
      update: {},
      create: { nombre: a },
    });
  }

  const cargos = ['Gerente', 'Asistente', 'Operario', 'Vendedor'];
  for (const c of cargos) {
    await prisma.cargo.upsert({
      where: { nombre: c },
      update: {},
      create: { nombre: c },
    });
  }

  console.log('✅ Datos predeterminados insertados correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
