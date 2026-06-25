import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/purchases')
export class PurchasesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getPurchases() {
    return this.prisma.compra.findMany({
      include: { proveedor: true, almacen: true, detalles: { include: { producto: true } } },
      orderBy: { fecha: 'desc' },
    });
  }

  @Get('proveedores')
  async getProveedores() {
    return this.prisma.proveedor.findMany();
  }

  @Post()
  async createPurchase(@Body() data: any) {
    const ultima = await this.prisma.compra.findFirst({ orderBy: { id: 'desc' } });
    const codigoSistema = `COM-${String((ultima?.id || 0) + 1).padStart(6, '0')}`;

    return this.prisma.$transaction(async (tx: any) => {
      const compra = await tx.compra.create({
        data: {
          codigoSistema,
          fecha: new Date(data.fecha || new Date()),
          tipoDocumento: data.tipoDocumento,
          numeroDocumento: data.numeroDocumento,
          estado: data.estado || 'PENDIENTE',
          observacion: data.observacion,
          proveedorId: Number(data.proveedorId),
          almacenId: Number(data.almacenId),
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

      if (compra.estado === 'RECIBIDA') {
        for (const detalle of compra.detalles) {
          await tx.movimientoInventario.create({
            data: {
              tipo: 'INGRESO',
              cantidad: detalle.cantidad,
              observacion: `Ingreso por compra ${compra.codigoSistema}`,
              productoId: detalle.productoId,
              almacenId: compra.almacenId,
            },
          });

          const stock = await tx.stockAlmacen.findUnique({
            where: { productoId_almacenId: { productoId: detalle.productoId, almacenId: compra.almacenId } },
          });

          if (stock) {
            await tx.stockAlmacen.update({
              where: { id: stock.id },
              data: { stockActual: { increment: detalle.cantidad } },
            });
          } else {
            await tx.stockAlmacen.create({
              data: { productoId: detalle.productoId, almacenId: compra.almacenId, stockActual: detalle.cantidad },
            });
          }

          await tx.producto.update({
            where: { id: detalle.productoId },
            data: { stockActual: { increment: detalle.cantidad } },
          });
        }
      }
      return compra;
    });
  }
}
