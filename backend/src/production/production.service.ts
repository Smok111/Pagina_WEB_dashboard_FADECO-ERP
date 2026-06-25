import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.ordenProduccion.findMany({
      include: { productoFinal: true, consumos: { include: { producto: true } }, lotes: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    const ultima = await this.prisma.ordenProduccion.findFirst({ orderBy: { id: 'desc' } });
    const codigoOP = `OP-${String((ultima?.id || 0) + 1).padStart(6, '0')}`;

    return this.prisma.ordenProduccion.create({
      data: {
        codigoOP,
        productoFinalId: Number(data.productoFinalId),
        cantidadEsperada: Number(data.cantidadEsperada),
        fechaInicio: new Date(data.fechaInicio || new Date()),
        estado: 'PENDIENTE',
      },
    });
  }

  async start(id: number) {
    return this.prisma.ordenProduccion.update({
      where: { id },
      data: { estado: 'EN_PROCESO' },
    });
  }

  async addConsumo(opId: number, data: any) {
    return this.prisma.$transaction(async (tx: any) => {
      const consumo = await tx.consumoMateriaPrima.create({
        data: {
          ordenProduccionId: opId,
          productoId: Number(data.productoId),
          cantidad: Number(data.cantidad),
          almacenId: Number(data.almacenId || 1), // Default warehouse
        },
      });

      // Registrar movimiento de inventario
      await tx.movimientoInventario.create({
        data: {
          tipo: 'SALIDA',
          cantidad: consumo.cantidad,
          observacion: `Consumo para OP-${opId}`,
          productoId: consumo.productoId,
          almacenId: consumo.almacenId,
        },
      });

      // Descontar stock
      const stock = await tx.stockAlmacen.findUnique({
        where: { productoId_almacenId: { productoId: consumo.productoId, almacenId: consumo.almacenId } },
      });

      if (stock && stock.stockActual >= consumo.cantidad) {
        await tx.stockAlmacen.update({
          where: { id: stock.id },
          data: { stockActual: { decrement: consumo.cantidad } },
        });
      }

      await tx.producto.update({
        where: { id: consumo.productoId },
        data: { stockActual: { decrement: consumo.cantidad } },
      });

      return consumo;
    });
  }

  async finish(id: number, data: any, userId: number) {
    return this.prisma.$transaction(async (tx: any) => {
      const op = await tx.ordenProduccion.update({
        where: { id },
        data: {
          estado: 'FINALIZADA',
          cantidadReal: Number(data.cantidadReal),
          fechaFin: new Date(),
        },
        include: { productoFinal: true }
      });

      const numeroLote = `LOT-${op.codigoOP}-${Date.now().toString().slice(-4)}`;

      // Crear el Lote
      const lote = await tx.lote.create({
        data: {
          numeroLote,
          ordenProduccionId: op.id,
          fechaFabricacion: new Date(),
          fechaVencimiento: new Date(new Date().setMonth(new Date().getMonth() + 6)), // 6 meses después
          responsableId: userId,
          estado: 'ACTIVO',
        },
      });

      // Ingresar el producto terminado al inventario (Almacén 1 por defecto)
      const almacenId = 1;
      await tx.movimientoInventario.create({
        data: {
          tipo: 'INGRESO',
          cantidad: op.cantidadReal,
          observacion: `Producción finalizada ${op.codigoOP} (Lote: ${numeroLote})`,
          productoId: op.productoFinalId,
          almacenId,
        },
      });

      const stock = await tx.stockAlmacen.findUnique({
        where: { productoId_almacenId: { productoId: op.productoFinalId, almacenId } },
      });

      if (stock) {
        await tx.stockAlmacen.update({
          where: { id: stock.id },
          data: { stockActual: { increment: op.cantidadReal } },
        });
      } else {
        await tx.stockAlmacen.create({
          data: { productoId: op.productoFinalId, almacenId, stockActual: op.cantidadReal },
        });
      }

      await tx.producto.update({
        where: { id: op.productoFinalId },
        data: { stockActual: { increment: op.cantidadReal } },
      });

      return op;
    });
  }
}
