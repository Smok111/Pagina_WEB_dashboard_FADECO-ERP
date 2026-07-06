import { Controller, Get, Post, Body, Delete, Param, BadRequestException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Controller('api/purchases')
export class PurchasesController {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  @Get()
  async getPurchases() {
    return this.prisma.compra.findMany({
      include: {
        proveedor: true,
        almacen: true,
        detalles: { include: { producto: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  @Get('proveedores')
  async getProveedores() {
    return this.prisma.proveedor.findMany();
  }

  @Post('proveedores')
  async createProveedor(@Body() data: any) {
    const ultima = await this.prisma.proveedor.findFirst({
      orderBy: { id: 'desc' },
    });
    const codigoSistema = `PROV-${String((ultima?.id || 0) + 1).padStart(6, '0')}`;

    return this.prisma.proveedor.create({
      data: {
        codigoSistema,
        ruc: data.ruc,
        razonSocial: data.razonSocial,
        direccion: data.direccion,
        telefono: data.telefono,
        correo: data.correo,
        contacto: data.contacto,
        activo: true,
      },
    });
  }

  @Post()
  async createPurchase(@Body() data: any) {
    const ultima = await this.prisma.compra.findFirst({
      orderBy: { id: 'desc' },
    });
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
            where: {
              productoId_almacenId: {
                productoId: detalle.productoId,
                almacenId: compra.almacenId,
              },
            },
          });

          if (stock) {
            await tx.stockAlmacen.update({
              where: { id: stock.id },
              data: { stockActual: { increment: detalle.cantidad } },
            });
          } else {
            await tx.stockAlmacen.create({
              data: {
                productoId: detalle.productoId,
                almacenId: compra.almacenId,
                stockActual: detalle.cantidad,
              },
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

  @Delete(':id')
  async deletePurchase(@Param('id') id: string) {
    const compraId = Number(id);
    try {
      return await this.prisma.$transaction(async (tx: any) => {
        const compra = await tx.compra.findUnique({
          where: { id: compraId },
          include: { detalles: true },
        });
        if (!compra) throw new BadRequestException('Compra no encontrada');

        // Si la compra ya fue recibida, revertir el stock
        if (compra.estado === 'RECIBIDA') {
          for (const detalle of compra.detalles) {
            const stock = await tx.stockAlmacen.findUnique({
              where: {
                productoId_almacenId: {
                  productoId: detalle.productoId,
                  almacenId: compra.almacenId,
                },
              },
            });

            if (stock) {
              const nuevoStock = Math.max(0, Number(stock.stockActual) - Number(detalle.cantidad));
              await tx.stockAlmacen.update({
                where: { id: stock.id },
                data: { stockActual: nuevoStock },
              });
            }

            // Registrar movimiento de salida por anulación
            await tx.movimientoInventario.create({
              data: {
                tipo: 'SALIDA',
                cantidad: detalle.cantidad,
                observacion: `Anulación de compra ${compra.codigoSistema}`,
                productoId: detalle.productoId,
                almacenId: compra.almacenId,
              },
            });

            // Recalcular producto.stockActual
            const allStocks = await tx.stockAlmacen.findMany({
              where: { productoId: detalle.productoId },
            });
            const totalStock = allStocks.reduce(
              (sum: number, s: any) => sum + Math.max(0, Number(s.stockActual)),
              0,
            );
            await tx.producto.update({
              where: { id: detalle.productoId },
              data: { stockActual: totalStock },
            });
          }
        }

        await tx.detalleCompra.deleteMany({ where: { compraId } });
        await tx.compra.delete({ where: { id: compraId } });
        return { ok: true };
      });
    } catch (error: any) {
      throw new BadRequestException(error.message || 'No se pudo eliminar la compra');
    }
  }

  @Post(':id/archivo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const compra = await this.prisma.compra.findUnique({ where: { id: Number(id) } });
    if (!compra) throw new BadRequestException('Compra no encontrada');

    const timestamp = Date.now();
    const filePath = `compras/${compra.codigoSistema}/${timestamp}_${file.originalname.replace(/\s+/g, '_')}`;
    
    // Asumimos que usa Supabase como los demas modulos
    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'produccion';
    const url = await this.storageService.uploadFile(bucketName, filePath, file);

    return this.prisma.compra.update({
      where: { id: Number(id) },
      data: { archivoAdjunto: url },
    });
  }
}
