import { Injectable } from '@nestjs/common';
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
    return this.prisma.trabajador.create({
      data: {
        codigoInterno: data.codigoInterno,
        dni: data.dni,
        nombres: data.nombres,
        apellidos: data.apellidos,
        telefono: data.telefono,
        correo: data.correo,
        direccion: data.direccion,
        fechaIngreso: new Date(data.fechaIngreso),
        areaId: Number(data.areaId),
        cargoId: Number(data.cargoId),
        areaProduccionId: data.areaProduccionId ? Number(data.areaProduccionId) : null,
        usuarioId: data.usuarioId ? Number(data.usuarioId) : null,
        salarioBase: Number(data.salarioBase || 0),
      },
    });
  }

  async deleteTrabajador(id: number) {
    return this.prisma.trabajador.delete({
      where: { id },
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
}
