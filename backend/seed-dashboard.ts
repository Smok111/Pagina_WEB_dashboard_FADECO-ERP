import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando carga de datos iniciales...');

  // 1. Empresa y Sucursal
  const empresa = await prisma.empresa.upsert({
    where: { ruc: '20123456789' },
    update: {},
    create: {
      razonSocial: 'FADECO S.A.C.',
      ruc: '20123456789',
      moneda: 'PEN',
      igv: 18.0
    }
  });

  const sucursal = await prisma.sucursal.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nombre: 'Fábrica Principal',
      empresaId: empresa.id
    }
  });

  // 2. Roles y Usuario Admin
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'ADMINISTRADOR' },
    update: {},
    create: { nombre: 'ADMINISTRADOR', descripcion: 'Control total' }
  });

  await prisma.usuario.upsert({
    where: { email: 'admin@fadeco.com' },
    update: {},
    create: {
      nombres: 'Admin',
      apellidos: 'Principal',
      email: 'admin@fadeco.com',
      passwordHash: await bcrypt.hash('Admin123456*', 10),
      rolId: rolAdmin.id,
      sucursalId: sucursal.id
    }
  });

  let catMateria = await prisma.categoria.findFirst({ where: { nombre: 'Materia Prima' } });
  if (!catMateria) catMateria = await prisma.categoria.create({ data: { codigo: 'CAT-MP', nombre: 'Materia Prima' } });
  
  let catProd = await prisma.categoria.findFirst({ where: { nombre: 'Producto Terminado' } });
  if (!catProd) catProd = await prisma.categoria.create({ data: { codigo: 'CAT-PT', nombre: 'Producto Terminado' } });

  let unUnd = await prisma.unidadMedida.findFirst({ where: { nombre: 'Unidad' } });
  if (!unUnd) unUnd = await prisma.unidadMedida.create({ data: { codigo: 'UND', nombre: 'Unidad' } });
  
  let unKg = await prisma.unidadMedida.findFirst({ where: { nombre: 'Kilogramos' } });
  if (!unKg) unKg = await prisma.unidadMedida.create({ data: { codigo: 'KG', nombre: 'Kilogramos' } });

  // 4. Almacén Central
  const almacen = await prisma.almacen.upsert({
    where: { codigo: 'ALM-01' },
    update: {},
    create: { codigo: 'ALM-01', nombre: 'Almacén Central' }
  });

  // 5. Productos
  const p1 = await prisma.producto.upsert({
    where: { codigo: 'PROD-001' },
    update: {},
    create: {
      codigo: 'PROD-001',
      nombre: 'Cemento Sol',
      categoriaId: catMateria.id,
      unidadMedidaId: unKg.id,
      costo: 25,
      precioVenta: 30
    }
  });
  
  const p2 = await prisma.producto.upsert({
    where: { codigo: 'PROD-002' },
    update: {},
    create: {
      codigo: 'PROD-002',
      nombre: 'Bloque de Concreto 15x20x40',
      categoriaId: catProd.id,
      unidadMedidaId: unUnd.id,
      costo: 2,
      precioVenta: 4.5
    }
  });

  // 6. Inventario (Stock)
  await prisma.stockAlmacen.upsert({
    where: { productoId_almacenId: { productoId: p1.id, almacenId: almacen.id } },
    update: {},
    create: { productoId: p1.id, almacenId: almacen.id, stockActual: 1500 }
  });

  await prisma.stockAlmacen.upsert({
    where: { productoId_almacenId: { productoId: p2.id, almacenId: almacen.id } },
    update: {},
    create: { productoId: p2.id, almacenId: almacen.id, stockActual: 500 }
  });

  // 7. Área de Producción y Cargo
  const area = await prisma.area.upsert({ where: { nombre: 'Producción' }, update: {}, create: { nombre: 'Producción' }});
  const areaConcreto = await prisma.areaProduccion.upsert({ where: { nombre: 'Concreto' }, update: {}, create: { nombre: 'Concreto' }});
  const cargoOp = await prisma.cargo.upsert({ where: { nombre: 'Operario' }, update: {}, create: { nombre: 'Operario' }});

  // 8. Trabajador
  const trab = await prisma.trabajador.upsert({
    where: { dni: '12345678' },
    update: {},
    create: {
      dni: '12345678',
      nombres: 'Juan',
      apellidos: 'Perez',
      codigoInterno: 'OP-001',
      cargoId: cargoOp.id,
      areaId: area.id,
      areaProduccionId: areaConcreto.id,
      fechaIngreso: new Date()
    }
  });

  // 9. Simular una Orden de Producción Finalizada para los KPIs
  const op = await prisma.ordenProduccion.create({
    data: {
      codigoOP: 'OP-2026-0001',
      productoFinalId: p2.id,
      cantidadEsperada: 1000,
      cantidadReal: 1000,
      cantidadPendiente: 0,
      estado: 'FINALIZADA',
      fechaInicio: new Date(Date.now() - 86400000 * 2), // Hace 2 días
      fechaFin: new Date(),
      trabajadores: {
        create: { trabajadorId: trab.id }
      }
    }
  });

  await prisma.kardexProduccion.create({
    data: {
      ordenProduccionId: op.id,
      productoId: p2.id,
      trabajadorId: trab.id,
      cantidadProgramada: 1000,
      cantidadFabricada: 1000,
      horasTrabajadas: 16
    }
  });

  // 10. Simular una Venta de 2000 soles hoy
  const cliente = await prisma.cliente.create({
    data: { tipoDocumento: 'DNI', numeroDocumento: '99999999', nombres: 'Cliente Frecuente' }
  });

  await prisma.venta.create({
    data: {
      codigoSistema: 'VEN-0001',
      tipoDocumento: 'BOLETA',
      numeroDocumento: 'B001-00000001',
      clienteId: cliente.id,
      usuarioId: 1,
      total: 2000,
      estado: 'COMPLETADA',
      detalles: {
        create: {
          productoId: p2.id,
          cantidad: 100,
          precioUnitario: 20,
          subtotal: 2000
        }
      }
    }
  });

  // 11. Simular una Compra de 500 soles hoy
  const prov = await prisma.proveedor.create({
    data: { ruc: '20888888888', razonSocial: 'Proveedor Materiales' }
  });

  await prisma.compra.create({
    data: {
      codigoSistema: 'COM-0001',
      tipoDocumento: 'FACTURA',
      numeroDocumento: 'F001-00000001',
      proveedorId: prov.id,
      almacenId: almacen.id,
      total: 500,
      estado: 'COMPLETADA',
      detalles: {
        create: {
          productoId: p1.id,
          cantidad: 20,
          precioUnitario: 25,
          subtotal: 500
        }
      }
    }
  });

  console.log('Datos inyectados exitosamente.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
