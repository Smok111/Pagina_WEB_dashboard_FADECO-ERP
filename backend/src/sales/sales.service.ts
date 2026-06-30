import { Injectable, BadRequestException } from '@nestjs/common';
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

    const tipoDoc = data.tipoDocumento || 'BOLETA';
    
    const ultimaDoc = await this.prisma.venta.findFirst({
      where: { tipoDocumento: tipoDoc },
      orderBy: { id: 'desc' },
    });
    
    let correlativo = 1;
    if (ultimaDoc && ultimaDoc.numeroDocumento) {
       const parts = ultimaDoc.numeroDocumento.split('-');
       const numStr = parts.length > 1 ? parts[1] : parts[0];
       const parsed = parseInt(numStr, 10);
       if (!isNaN(parsed)) correlativo = parsed + 1;
    }
    
    const prefijo = tipoDoc === 'FACTURA' ? 'F001' : tipoDoc === 'BOLETA' ? 'B001' : 'P001';
    const numeroDocGenerado = `${prefijo}-${String(correlativo).padStart(6, '0')}`;

    return this.prisma.$transaction(async (tx: any) => {
      const estadoVenta = data.estado || 'COMPLETADA';
      
      // Validar stock antes de crear la venta
      if (estadoVenta === 'COMPLETADA') {
        for (const detalle of data.detalles) {
          const prod = await tx.producto.findUnique({ where: { id: Number(detalle.productoId) } });
          if (!prod) {
            throw new BadRequestException(`Producto no encontrado.`);
          }
          const stockDisponible = Math.max(0, prod.stockActual);
          if (stockDisponible < Number(detalle.cantidad)) {
            throw new BadRequestException(
              stockDisponible === 0
                ? `Sin stock para: ${prod.nombre}. No se puede vender.`
                : `Stock insuficiente para: ${prod.nombre}. Disponible: ${stockDisponible}, Solicitado: ${Number(detalle.cantidad)}`
            );
          }
        }
      }

      const venta = await tx.venta.create({
        data: {
          codigoSistema,
          fecha: new Date(data.fecha || new Date()),
          tipoDocumento: tipoDoc,
          numeroDocumento: data.numeroDocumento && data.numeroDocumento !== '0001' && data.numeroDocumento !== '' ? data.numeroDocumento : numeroDocGenerado,
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
            const nuevoStock = Math.max(0, stockRecord.stockActual - detalle.cantidad);
            await tx.stockAlmacen.update({
              where: { id: stockRecord.id },
              data: { stockActual: nuevoStock },
            });
          }

          // Actualizar stock del producto, nunca dejar negativo
          const prodActual = await tx.producto.findUnique({ where: { id: detalle.productoId } });
          const nuevoStockProd = Math.max(0, (prodActual?.stockActual || 0) - detalle.cantidad);
          await tx.producto.update({
            where: { id: detalle.productoId },
            data: { stockActual: nuevoStockProd },
          });
        }
      }
      return venta;
    });
  }
}
