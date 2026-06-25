import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmpresaService {
  constructor(private prisma: PrismaService) {}

  async getEmpresa() {
    return this.prisma.empresa.findFirst();
  }

  async upsertEmpresa(data: any) {
    const empresa = await this.prisma.empresa.findFirst();
    const updateData = {
      ruc: data.ruc,
      razonSocial: data.razonSocial,
      direccion: data.direccion,
      telefono: data.telefono,
      correo: data.correo,
      moneda: data.moneda,
      igv: data.igv,
    };

    if (empresa) {
      return this.prisma.empresa.update({
        where: { id: empresa.id },
        data: updateData,
      });
    } else {
      return this.prisma.empresa.create({
        data: updateData,
      });
    }
  }
}
