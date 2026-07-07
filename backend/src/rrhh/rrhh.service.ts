import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RrhhService {
  constructor(private prisma: PrismaService) {}

  async getAreas() {
    return this.prisma.area.findMany();
  }
  async getCargos() {
    return this.prisma.cargo.findMany();
  }

  async getTrabajadores() {
    return this.prisma.trabajador.findMany({
      select: {
        id: true,
        dni: true,
        nombres: true,
        apellidos: true,
        codigoInterno: true,
        telefono: true,
        correo: true,
        direccion: true,
        fechaIngreso: true,
        salarioBase: true,
        areaId: true,
        cargoId: true,
        areaProduccionId: true,
        area: { select: { id: true, nombre: true } },
        cargo: { select: { id: true, nombre: true } },
        areaProduccion: { select: { id: true, nombre: true } },
      },
    });
  }

  async createTrabajador(data: any) {
    try {
      return await this.prisma.trabajador.create({
        data: {
          codigoInterno: data.codigoInterno?.trim() || null,
          dni: data.dni,
          nombres: data.nombres,
          apellidos: data.apellidos,
          telefono: data.telefono || null,
          correo: data.correo?.trim() || null,
          direccion: data.direccion || null,
          fechaIngreso: new Date(data.fechaIngreso),
          areaId: Number(data.areaId),
          cargoId: Number(data.cargoId),
          areaProduccionId: data.areaProduccionId ? Number(data.areaProduccionId) : null,
          usuarioId: data.usuarioId ? Number(data.usuarioId) : null,
          salarioBase: Number(data.salarioBase || 0),
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'campo';
        throw new BadRequestException(`Ya existe un trabajador con ese ${field}. Verifique DNI o Código Interno.`);
      }
      throw error;
    }
  }

  async deleteTrabajador(id: number) {
    return this.prisma.$transaction(async (tx) => {
      await tx.ordenProduccionTrabajador.deleteMany({ where: { trabajadorId: id } });
      await tx.asistencia.deleteMany({ where: { trabajadorId: id } });
      await tx.vacaciones.deleteMany({ where: { trabajadorId: id } });
      await tx.kardexProduccion.deleteMany({ where: { trabajadorId: id } });
      await tx.controlCalidad.deleteMany({ where: { inspectorId: id } });
      await tx.incidenciaProduccion.deleteMany({ where: { trabajadorId: id } });
      
      await tx.ordenProduccion.updateMany({
        where: { responsableId: id },
        data: { responsableId: null }
      });

      return tx.trabajador.delete({ where: { id } });
    });
  }

  async createArea(data: any) {
    return this.prisma.area.create({
      data: { nombre: data.nombre, descripcion: data.descripcion },
    });
  }

  async createCargo(data: any) {
    return this.prisma.cargo.create({
      data: { nombre: data.nombre, descripcion: data.descripcion },
    });
  }

  async getAreasProduccion() {
    return this.prisma.areaProduccion.findMany();
  }

  async createAreaProduccion(data: any) {
    return this.prisma.areaProduccion.create({
      data: { nombre: data.nombre, descripcion: data.descripcion },
    });
  }

  async importWorkers(file: Express.Multer.File) {
    const xlsx = require('xlsx');
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    let count = 0;
    for (const row of data as any[]) {
      if (!row.DNI || !row.Nombres) continue;
      
      let area = await this.prisma.area.findFirst({ where: { nombre: row.Area || 'Producción' } });
      if (!area) area = await this.prisma.area.create({ data: { nombre: row.Area || 'Producción' } });

      let cargo = await this.prisma.cargo.findFirst({ where: { nombre: row.Cargo || 'Operario' } });
      if (!cargo) cargo = await this.prisma.cargo.create({ data: { nombre: row.Cargo || 'Operario', descripcion: 'Cargo importado' } });

      await this.prisma.trabajador.upsert({
        where: { dni: String(row.DNI) },
        update: {
          nombres: row.Nombres,
          apellidos: row.Apellidos || '',
          codigoInterno: row.CodigoInterno ? String(row.CodigoInterno) : null,
          areaId: area.id,
          cargoId: cargo.id,
          salarioBase: Number(row.Salario) || 0,
        },
        create: {
          dni: String(row.DNI),
          nombres: row.Nombres,
          apellidos: row.Apellidos || '',
          codigoInterno: row.CodigoInterno ? String(row.CodigoInterno) : null,
          fechaIngreso: new Date(),
          areaId: area.id,
          cargoId: cargo.id,
          salarioBase: Number(row.Salario) || 0,
        }
      });
      count++;
    }
    return { success: true, imported: count };
  }

  // --- ENTREGAS EPP ---
  async getEntregasEPP() {
    return this.prisma.entregaEPP.findMany({
      include: {
        trabajador: { select: { id: true, nombres: true, apellidos: true, dni: true } },
        producto: { select: { id: true, codigo: true, nombre: true } },
        almacen: { select: { id: true, nombre: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async getEntregasEPPByTrabajador(trabajadorId: number) {
    return this.prisma.entregaEPP.findMany({
      where: { trabajadorId },
      include: {
        producto: { select: { id: true, codigo: true, nombre: true } },
        almacen: { select: { id: true, nombre: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async createEntregaEPP(data: any) {
    const trabajadorId = Number(data.trabajadorId);
    const productoId = Number(data.productoId);
    const almacenId = Number(data.almacenId);
    const cantidad = Number(data.cantidad || 1);
    const fecha = data.fecha ? new Date(data.fecha) : new Date();
    const observacion = data.observacion || null;

    // Obtener el nombre del trabajador para la observación del movimiento
    const trabajador = await this.prisma.trabajador.findUnique({
      where: { id: trabajadorId },
      select: { nombres: true, apellidos: true },
    });
    if (!trabajador) throw new BadRequestException('Trabajador no encontrado');

    return this.prisma.$transaction(async (tx) => {
      // 1. Crear el registro de entrega EPP
      const entrega = await tx.entregaEPP.create({
        data: {
          fecha,
          trabajadorId,
          productoId,
          almacenId,
          cantidad,
          observacion,
        },
        include: {
          trabajador: { select: { id: true, nombres: true, apellidos: true } },
          producto: { select: { id: true, codigo: true, nombre: true } },
          almacen: { select: { id: true, nombre: true } },
        },
      });

      // 2. Descontar stock del almacén
      const stockAlmacen = await tx.stockAlmacen.findUnique({
        where: { productoId_almacenId: { productoId, almacenId } },
      });
      if (stockAlmacen) {
        await tx.stockAlmacen.update({
          where: { id: stockAlmacen.id },
          data: { stockActual: { decrement: cantidad } },
        });
      }

      // 3. Descontar stock global del producto
      await tx.producto.update({
        where: { id: productoId },
        data: { stockActual: { decrement: cantidad } },
      });

      // 4. Registrar movimiento de inventario (SALIDA)
      await tx.movimientoInventario.create({
        data: {
          productoId,
          almacenId,
          tipo: 'SALIDA',
          cantidad,
          observacion: `Entrega EPP a ${trabajador.nombres} ${trabajador.apellidos}`,
        },
      });

      return entrega;
    });
  }
}

