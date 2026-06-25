import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.rol.findMany({
      include: { usuarios: { select: { id: true, email: true } } },
    });
  }

  async findOne(id: number) {
    return this.prisma.rol.findUnique({ where: { id } });
  }

  async create(data: { nombre: string; descripcion?: string }) {
    return this.prisma.rol.create({ data });
  }

  async update(id: number, data: { nombre?: string; descripcion?: string }) {
    return this.prisma.rol.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.rol.delete({ where: { id } });
  }
}
