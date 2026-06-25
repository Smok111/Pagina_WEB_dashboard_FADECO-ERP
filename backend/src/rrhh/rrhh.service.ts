import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RrhhService {
  constructor(private prisma: PrismaService) {}

  async getAreas() { return this.prisma.area.findMany(); }
  async getCargos() { return this.prisma.cargo.findMany(); }
  
  async getTrabajadores() {
    return this.prisma.trabajador.findMany({
      include: { area: true, cargo: true }
    });
  }

  async createTrabajador(data: any) {
    return this.prisma.trabajador.create({
      data: {
        dni: data.dni,
        nombres: data.nombres,
        apellidos: data.apellidos,
        fechaIngreso: new Date(data.fechaIngreso),
        areaId: Number(data.areaId),
        cargoId: Number(data.cargoId),
        salarioBase: Number(data.salarioBase),
      }
    });
  }

  async createArea(data: any) {
    return this.prisma.area.create({ data: { nombre: data.nombre, descripcion: data.descripcion } });
  }

  async createCargo(data: any) {
    return this.prisma.cargo.create({ data: { nombre: data.nombre, descripcion: data.descripcion } });
  }
}
