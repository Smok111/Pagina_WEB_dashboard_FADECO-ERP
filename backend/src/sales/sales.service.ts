import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.venta.findMany({
      include: {
        cliente: true,
        usuario: true,
        detalles: { include: { producto: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async getClientes() {
    return this.prisma.cliente.findMany();
  }

  async createCliente(data: any) {
    return this.prisma.cliente.create({
      data: {
        tipoDocumento: data.tipoDocumento || 'DNI',
        numeroDocumento: data.numeroDocumento,
        nombres: data.nombres,
        apellidos: data.apellidos,
        razonSocial: data.razonSocial,
        direccion: data.direccion,
        telefono: data.telefono,
        correo: data.correo,
        estado: true,
      },
    });
  }

  async create(data: any, userId: number = 1) {
    const ultima = await this.prisma.venta.findFirst({
      orderBy: { id: 'desc' },
    });
    const codigoSistema = `VEN-${String((ultima?.id || 0) + 1).padStart(6, '0')}`;

    return this.prisma.$transaction(async (tx: any) => {
      const venta = await tx.venta.create({
        data: {
          codigoSistema,
          fecha: new Date(data.fecha || new Date()),
          tipoDocumento: data.tipoDocumento || 'BOLETA',
          numeroDocumento: data.numeroDocumento || '0001',
          estado: data.estado || 'COMPLETADA',
          observacion: data.observacion,
          clienteId: Number(data.clienteId),
          usuarioId: userId,
          subtotal: Number(data.subtotal),
          igv: Number(data.igv),
          total: Number(data.total),
          detalles: {
            create: data.detalles.map((d: any) => ({
              productoId: Number(d.productoId),
              cantidad: Number(d.cantidad),
              precioUnitario: Number(d.precioUnitario),
              subtotal: Number(d.subtotal),
            })),
          },
        },
        include: { detalles: true },
      });

      if (venta.estado === 'COMPLETADA') {
        for (const detalle of venta.detalles) {
          let stockRecord = await tx.stockAlmacen.findFirst({
            where: { productoId: detalle.productoId, stockActual: { gt: 0 } },
            orderBy: { stockActual: 'desc' }
          });
          
          if (!stockRecord) {
             stockRecord = await tx.stockAlmacen.findFirst({
               where: { productoId: detalle.productoId }
             });
          }

          const almacenId = stockRecord ? stockRecord.almacenId : 1;

          await tx.movimientoInventario.create({
            data: {
              tipo: 'SALIDA',
              cantidad: detalle.cantidad,
              observacion: `Salida por venta ${venta.codigoSistema}`,
              productoId: detalle.productoId,
              almacenId,
            },
          });

          if (stockRecord) {
            await tx.stockAlmacen.update({
              where: { id: stockRecord.id },
              data: { stockActual: { decrement: detalle.cantidad } },
            });
          } else {
            await tx.stockAlmacen.create({
              data: {
                productoId: detalle.productoId,
                almacenId,
                stockActual: -detalle.cantidad,
              }
            });
          }

          await tx.producto.update({
            where: { id: detalle.productoId },
            data: { stockActual: { decrement: detalle.cantidad } },
          });
        }
      }
      return venta;
    });
  }
}
