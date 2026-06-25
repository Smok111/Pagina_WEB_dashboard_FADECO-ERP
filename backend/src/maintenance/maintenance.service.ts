import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async getEquipos() {
    return this.prisma.equipo.findMany({
      include: {
        mantenimientos: { orderBy: { fechaProgramada: 'desc' }, take: 1 },
      },
    });
  }

  async createEquipo(data: any) {
    const ultimo = await this.prisma.equipo.findFirst({
      orderBy: { id: 'desc' },
    });
    const codigo =
      data.codigo || `EQP-${String((ultimo?.id || 0) + 1).padStart(4, '0')}`;
    return this.prisma.equipo.create({
      data: {
        codigo,
        nombre: data.nombre,
        ubicacion: data.ubicacion,
      },
    });
  }

  async getMantenimientos() {
    return this.prisma.mantenimientoEquipo.findMany({
      include: { equipo: true },
      orderBy: { fechaProgramada: 'desc' },
    });
  }

  async createMantenimiento(data: any) {
    return this.prisma.mantenimientoEquipo.create({
      data: {
        equipoId: Number(data.equipoId),
        tipo: data.tipo,
        fechaProgramada: new Date(data.fechaProgramada),
        detalles: data.detalles,
        estado: 'PROGRAMADO',
      },
    });
  }

  async finishMantenimiento(id: number, data: any) {
    return this.prisma.$transaction(async (tx) => {
      const mant = await tx.mantenimientoEquipo.update({
        where: { id },
        data: {
          estado: 'COMPLETADO',
          fechaRealizacion: new Date(),
          costo: Number(data.costo || 0),
          detalles: data.detalles || undefined,
        },
      });

      await tx.equipo.update({
        where: { id: mant.equipoId },
        data: { estado: 'OPERATIVO' },
      });

      return mant;
    });
  }
}
