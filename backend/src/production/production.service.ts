import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ProductionService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService
  ) {}

  async findAll() {
    return this.prisma.ordenProduccion.findMany({
      select: {
        id: true,
        codigoOP: true,
        estado: true,
        cantidadEsperada: true,
        cantidadReal: true,
        cantidadPendiente: true,
        destino: true,
        fechaInicio: true,
        fechaFin: true,
        observaciones: true,
        createdAt: true,
        productoFinal: { select: { id: true, nombre: true, codigo: true } },
        trabajadores: { select: { trabajador: { select: { id: true, nombres: true, apellidos: true } } } },
        areaProduccion: { select: { id: true, nombre: true } },
        responsable: { select: { id: true, nombres: true, apellidos: true } },
        archivos: { select: { id: true, nombreArchivo: true, urlArchivo: true, tipoArchivo: true } },
        lotes: { select: { id: true, numeroLote: true } },
        consumos: { include: { producto: { select: { nombre: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any, userId: number) {
    const year = new Date().getFullYear();
    const lastOrder = await this.prisma.ordenProduccion.findFirst({
      where: { codigoOP: { startsWith: `OP-${year}-` } },
      orderBy: { codigoOP: 'desc' },
    });
    
    let nextNum = 1;
    if (lastOrder) {
      const parts = lastOrder.codigoOP.split('-');
      if (parts.length === 3) {
         nextNum = parseInt(parts[2], 10) + 1;
      }
    }
    const codigoOP = `OP-${year}-${String(nextNum).padStart(4, '0')}`;

    return this.prisma.ordenProduccion.create({
      data: {
        codigoOP,
        productoFinalId: Number(data.productoFinalId),
        cantidadEsperada: Number(data.cantidadEsperada),
        cantidadPendiente: Number(data.cantidadEsperada),
        fechaInicio: new Date(data.fechaInicio || new Date()),
        estado: 'PENDIENTE',
        destino: data.destino || 'STOCK',
        observaciones: data.observaciones,
        areaProduccionId: data.areaProduccionId ? Number(data.areaProduccionId) : null,
        responsableId: data.responsableId ? Number(data.responsableId) : null,
        ventaId: data.ventaId ? Number(data.ventaId) : null,
      },
    });
  }

  async start(id: number, userId: number = 1) {
    return this.prisma.$transaction(async (tx) => {
      const op = await tx.ordenProduccion.update({
        where: { id },
        data: { estado: 'EN_PROCESO' },
      });

      await tx.estadoProduccion.create({
        data: {
          ordenProduccionId: id,
          estadoAnterior: 'PENDIENTE',
          estadoNuevo: 'EN_PROCESO',
          usuarioId: userId,
        },
      });

      return op;
    });
  }

  async assignWorkers(opId: number, data: { trabajadorIds: number[] }) {
    return this.prisma.$transaction(async (tx) => {
      await tx.ordenProduccionTrabajador.deleteMany({
        where: { ordenProduccionId: opId }
      });
      
      const assignments = data.trabajadorIds.map((tId) => ({
        ordenProduccionId: opId,
        trabajadorId: Number(tId),
      }));
      
      if (assignments.length > 0) {
        await tx.ordenProduccionTrabajador.createMany({
          data: assignments,
        });
      }
      return { success: true, count: assignments.length };
    });
  }

  async addQualityControl(opId: number, data: any) {
    return this.prisma.controlCalidad.create({
      data: {
        ordenProduccionId: opId,
        resultado: data.resultado,
        observaciones: data.observaciones,
        inspectorId: Number(data.inspectorId),
      },
    });
  }

  async addIssue(opId: number, data: any) {
    return this.prisma.incidenciaProduccion.create({
      data: {
        ordenProduccionId: opId,
        trabajadorId: Number(data.trabajadorId),
        descripcion: data.descripcion,
      },
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
        where: {
          productoId_almacenId: {
            productoId: consumo.productoId,
            almacenId: consumo.almacenId,
          },
        },
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
      const cantidadReal = Number(data.cantidadReal);
      const horasTrabajadas = Number(data.horasTrabajadas || 0);

      const op = await tx.ordenProduccion.update({
        where: { id },
        data: {
          estado: 'FINALIZADA',
          cantidadReal,
          cantidadPendiente: { decrement: cantidadReal },
          fechaFin: new Date(),
        },
        include: { productoFinal: true, trabajadores: true },
      });

      await tx.estadoProduccion.create({
        data: {
          ordenProduccionId: id,
          estadoAnterior: 'EN_PROCESO',
          estadoNuevo: 'FINALIZADA',
          usuarioId: userId,
        },
      });

      if (op.trabajadores.length > 0) {
        const cantidadPorTrabajador = cantidadReal / op.trabajadores.length;
        const programadaPorTrabajador = Number(op.cantidadEsperada) / op.trabajadores.length;
        const horasPorTrabajador = horasTrabajadas / op.trabajadores.length;

        for (const pt of op.trabajadores) {
          await tx.kardexProduccion.create({
            data: {
              ordenProduccionId: id,
              productoId: op.productoFinalId,
              trabajadorId: pt.trabajadorId,
              cantidadProgramada: programadaPorTrabajador,
              cantidadFabricada: cantidadPorTrabajador,
              horasTrabajadas: horasPorTrabajador,
              observaciones: data.observaciones,
            }
          });
        }
      }

      const numeroLote = `LOT-${op.codigoOP}-${Date.now().toString().slice(-4)}`;

      await tx.lote.create({
        data: {
          numeroLote,
          ordenProduccionId: op.id,
          fechaFabricacion: new Date(),
          fechaVencimiento: new Date(new Date().setMonth(new Date().getMonth() + 6)),
          responsableId: userId,
          estado: 'ACTIVO',
        },
      });

      const almacenId = 1;
      await tx.movimientoInventario.create({
        data: {
          tipo: 'INGRESO',
          cantidad: cantidadReal,
          observacion: `Producción finalizada ${op.codigoOP} (Lote: ${numeroLote}) - Destino: ${op.destino}`,
          productoId: op.productoFinalId,
          almacenId,
        },
      });

      const stock = await tx.stockAlmacen.findUnique({
        where: {
          productoId_almacenId: { productoId: op.productoFinalId, almacenId },
        },
      });

      if (stock) {
        await tx.stockAlmacen.update({
          where: { id: stock.id },
          data: { stockActual: { increment: cantidadReal } },
        });
      } else {
        await tx.stockAlmacen.create({
          data: {
            productoId: op.productoFinalId,
            almacenId,
            stockActual: cantidadReal,
          },
        });
      }

      await tx.producto.update({
        where: { id: op.productoFinalId },
        data: { stockActual: { increment: cantidadReal } },
      });

      await tx.auditoria.create({
        data: {
          usuarioId: userId,
          accion: 'FINALIZAR_ORDEN',
          modulo: 'PRODUCCION',
          descripcion: `OP finalizada: ${op.codigoOP}, Cantidad Real: ${cantidadReal}`,
        }
      });

      if (op.ventaId) {
        await tx.venta.update({
          where: { id: op.ventaId },
          data: { estado: 'COMPLETADA' },
        });
      }

      return op;
    });
  }

  async addFile(opId: number, file: Express.Multer.File) {
    const op = await this.prisma.ordenProduccion.findUnique({ where: { id: opId } });
    if (!op) throw new NotFoundException('Orden de producción no encontrada');

    const timestamp = Date.now();
    const filePath = `produccion/${op.codigoOP}/${timestamp}_${file.originalname.replace(/\s+/g, '_')}`;

    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'produccion';
    const url = await this.storageService.uploadFile(bucketName, filePath, file);

    return this.prisma.archivoProduccion.create({
      data: {
        ordenProduccionId: opId,
        nombreArchivo: file.originalname,
        urlArchivo: url,
        tipoArchivo: file.mimetype,
      },
    });
  }

  async deleteFile(archivoId: number) {
    const archivo = await this.prisma.archivoProduccion.findUnique({ where: { id: archivoId } });
    if (!archivo) throw new NotFoundException('Archivo no encontrado');

    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'produccion';
    const urlParts = archivo.urlArchivo.split(`/${bucketName}/`);
    if (urlParts.length === 2) {
      const path = urlParts[1];
      try {
        await this.storageService.deleteFile(bucketName, decodeURIComponent(path));
      } catch (e) {
        console.error("Supabase delete error", e);
      }
    }

    return this.prisma.archivoProduccion.delete({ where: { id: archivoId } });
  }

  async delete(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const op = await tx.ordenProduccion.findUnique({ where: { id }, include: { archivos: true } });
      if (!op) throw new NotFoundException('Orden de producción no encontrada');
      
      if (op.estado !== 'PENDIENTE') {
        throw new Error('Solo se pueden eliminar órdenes en estado PENDIENTE');
      }

      const bucketName = process.env.SUPABASE_BUCKET_NAME || 'produccion';
      for (const archivo of op.archivos) {
        const urlParts = archivo.urlArchivo.split(`/${bucketName}/`);
        if (urlParts.length === 2) {
          try {
             await this.storageService.deleteFile(bucketName, decodeURIComponent(urlParts[1]));
          } catch(e) {}
        }
      }

      await tx.archivoProduccion.deleteMany({ where: { ordenProduccionId: id } });
      await tx.ordenProduccionTrabajador.deleteMany({ where: { ordenProduccionId: id } });
      
      return tx.ordenProduccion.delete({ where: { id } });
    });
  }
}
