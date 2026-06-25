import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        activo: true,
        rolId: true,
        sucursalId: true,
        rol: true,
        sucursal: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
      include: { rol: true, sucursal: true },
    });
  }

  async create(data: any) {
    const passwordHash = await bcrypt.hash(data.password || '123456', 10);
    return this.prisma.usuario.create({
      data: {
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        passwordHash,
        rolId: Number(data.rolId),
        sucursalId: Number(data.sucursalId || 1), // Default sucursal if not provided
        activo: data.activo ?? true,
      },
    });
  }

  async update(id: number, data: any) {
    const updateData: any = { ...data };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }
    delete updateData.password;

    if (data.rolId) updateData.rolId = Number(data.rolId);
    if (data.sucursalId) updateData.sucursalId = Number(data.sucursalId);

    return this.prisma.usuario.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    return this.prisma.usuario.delete({ where: { id } });
  }
}
