import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/inventory')
export class InventoryController {
  constructor(private prisma: PrismaService) { }

  // --- CATEGORÍAS ---
  @Get('categorias')
  async getCategorias() {
    return this.prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
  }

  @Post('categorias')
  async createCategoria(@Body() data: any) {
    // Generar un código basado en el ID si no envían código
    const ultimo = await this.prisma.categoria.findFirst({
      orderBy: { id: 'desc' },
    });
    const codigo =
      data.codigo || `CAT-${String((ultimo?.id || 0) + 1).padStart(3, '0')}`;

    return this.prisma.categoria.create({
      data: {
        codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
      },
    });
  }

  @Put('categorias')
  async updateCategoria(@Body() data: any) {
    return this.prisma.categoria.update({
      where: { id: Number(data.id) },
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
      },
    });
  }

  @Delete('categorias/:id')
  async deleteCategoria(@Param('id') id: string) {
    try {
      await this.prisma.categoria.delete({ where: { id: Number(id) } });
      return { ok: true };
    } catch (error: any) {
      throw new BadRequestException('No se puede eliminar la categoría porque tiene productos asociados. Elimine o reasigne los productos primero.');
    }
  }

  // --- UNIDADES MEDIDA ---
  @Get('unidades-medida')
  async getUnidades() {
    return this.prisma.unidadMedida.findMany({ orderBy: { nombre: 'asc' } });
  }

  @Post('unidades-medida')
  async createUnidad(@Body() data: any) {
    return this.prisma.unidadMedida.create({
      data: {
        codigo: data.codigo || data.nombre.substring(0, 3).toUpperCase(),
        nombre: data.nombre,
      },
    });
  }

  @Put('unidades-medida')
  async updateUnidad(@Body() data: any) {
    return this.prisma.unidadMedida.update({
      where: { id: Number(data.id) },
      data: { codigo: data.codigo, nombre: data.nombre },
    });
  }

  @Delete('unidades-medida/:id')
  async deleteUnidad(@Param('id') id: string) {
    try {
      await this.prisma.unidadMedida.delete({ where: { id: Number(id) } });
      return { ok: true };
    } catch (error: any) {
      throw new BadRequestException('No se puede eliminar la unidad porque tiene productos asociados. Elimine o reasigne los productos primero.');
    }
  }

  // --- ALMACENES ---
  @Get('almacenes')
  async getAlmacenes() {
    return this.prisma.almacen.findMany({ orderBy: { nombre: 'asc' } });
  }

  @Get('almacenes/:id')
  async getAlmacen(@Param('id') idParam: string) {
    const almacen = await this.prisma.almacen.findUnique({
      where: { id: Number(idParam) },
      include: { 
        stocks: { include: { producto: true } },
        equipos: true
      },
    });
    if (almacen && almacen.stocks) {
      almacen.stocks = almacen.stocks.map((s: any) => ({
        ...s,
        stockActual: Math.max(0, s.stockActual),
      }));
    }
    return almacen;
  }

  @Post('almacenes')
  async createAlmacen(@Body() data: any) {
    const ultimo = await this.prisma.almacen.findFirst({
      orderBy: { id: 'desc' },
    });
    const codigo =
      data.codigo || `ALM-${String((ultimo?.id || 0) + 1).padStart(3, '0')}`;
    return this.prisma.almacen.create({
      data: { codigo, nombre: data.nombre, ubicacion: data.ubicacion, responsable: data.responsable },
    });
  }

  @Put('almacenes')
  async updateAlmacen(@Body() data: any) {
    return this.prisma.almacen.update({
      where: { id: Number(data.id) },
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        ubicacion: data.ubicacion,
        responsable: data.responsable,
      },
    });
  }

  @Delete('almacenes/:id')
  async deleteAlmacen(@Param('id') id: string) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.stockAlmacen.deleteMany({ where: { almacenId: Number(id) } });
        await tx.movimientoInventario.deleteMany({ where: { almacenId: Number(id) } });
        await tx.almacen.delete({ where: { id: Number(id) } });
      });
      return { ok: true };
    } catch (error: any) {
      throw new BadRequestException('No se puede eliminar el almacén porque tiene compras o consumos asociados.');
    }
  }

  // --- PRODUCTOS ---
  @Get('productos')
  async getProductos() {
    const productos = await this.prisma.producto.findMany({
      include: { categoria: true, unidadMedida: true },
      orderBy: { nombre: 'asc' },
    });
    return productos.map((p: any) => ({ ...p, stockActual: Math.max(0, p.stockActual) }));
  }

  @Get('productos/export')
  async exportProductos() {
    const productos = await this.prisma.producto.findMany({
      include: {
        unidadMedida: true,
        MovimientoInventario: true,
      },
      orderBy: { nombre: 'asc' },
    });

    return productos.map((p) => {
      let entrada = 0;
      let salida = 0;
      p.MovimientoInventario.forEach((m) => {
        if (m.tipo === 'INGRESO') entrada += Number(m.cantidad);
        if (m.tipo === 'SALIDA') salida += Number(m.cantidad);
      });
      return {
        CODIGO: p.codigo,
        PRODUCTO: p.nombre,
        MARCA: p.marca || '',
        COLOR: p.color || '',
        ENTRADA: entrada,
        UNIDAD: p.unidadMedida?.nombre || '',
        SALIDA: salida,
        STOCK: Number(p.stockActual)
      };
    });
  }

  @Post('productos')
  async createProducto(@Body() data: any) {
    const ultimo = await this.prisma.producto.findFirst({
      orderBy: { id: 'desc' },
    });
    const codigoSistema = `PRO-${String((ultimo?.id || 0) + 1).padStart(6, '0')}`;
    const stockActual = Number(data.stockActual || 0);
    const almacenId = data.almacenId ? Number(data.almacenId) : null;

    const productoData: any = {
      codigoSistema,
      codigo: codigoSistema,
      nombre: data.nombre,
      descripcion: data.descripcion,
      marca: data.marca,
      color: data.color,
      categoriaId: Number(data.categoriaId),
      unidadMedidaId: Number(data.unidadMedidaId),
      stockActual: stockActual,
      stockMinimo: Number(data.stockMinimo || 0),
      costo: Number(data.costo || 0),
      precioVenta: Number(data.precioVenta || 0),
      estado: true,
    };

    if (stockActual > 0 && almacenId) {
      productoData.StockAlmacen = {
        create: {
          almacenId: almacenId,
          stockActual: stockActual
        }
      };
      productoData.MovimientoInventario = {
        create: {
          almacenId: almacenId,
          tipo: 'INGRESO',
          cantidad: stockActual,
          observacion: 'Inventario inicial'
        }
      };
    }

    return this.prisma.producto.create({
      data: productoData,
    });
  }

  @Get('productos/:id/kardex')
  async getKardex(@Param('id') idParam: string) {
    const movimientos = await this.prisma.movimientoInventario.findMany({
      where: { productoId: Number(idParam) },
      orderBy: { fecha: 'asc' },
      include: { almacen: true },
    });

    let saldo = 0;
    const kardex = movimientos.map((m) => {
      const cant = Number(m.cantidad);
      if (m.tipo === 'INGRESO') saldo += cant;
      if (m.tipo === 'SALIDA') saldo -= cant;
      return {
        ...m,
        cantidad: cant,
        saldo,
      };
    });

    return kardex.reverse(); // Devolver el más reciente primero
  }

  @Post('productos/import')
  async importProductos(@Body() data: any[]) {
    const firstCat = await this.prisma.categoria.findFirst();
    const defaultCatId = firstCat?.id || 1;
    let createdCount = 0;
    let updatedCount = 0;

    // Get a map of unit names to IDs to resolve "UNIDAD" from Excel
    const unidades = await this.prisma.unidadMedida.findMany();
    const unidadMap = new Map(unidades.map(u => [u.nombre.toUpperCase(), u.id]));
    const defaultUniId = unidades[0]?.id || 1;

    for (const item of data) {
      const codigo = item.CODIGO || item.codigo;
      const nombre = item.PRODUCTO || item.nombre || item.NOMBRE || 'Producto Importado';
      const marca = item.MARCA || item.marca || null;
      const color = item.COLOR || item.color || null;
      const unidadNombre = item.UNIDAD || item.unidad || '';
      
      let unidadId = defaultUniId;
      if (unidadNombre) {
        const foundId = unidadMap.get(unidadNombre.toUpperCase());
        if (foundId) unidadId = foundId;
      }
      
      const stockActual = Number(item.STOCK || item.stockActual || item.stock || 0);
      const stockMinimo = Number(item.stockMinimo || 0);
      const costo = Number(item.costo || 0);
      const precioVenta = Number(item.precioVenta || 0);

      if (codigo) {
        // Try to update existing
        const existing = await this.prisma.producto.findUnique({ where: { codigo } });
        if (existing) {
          await this.prisma.producto.update({
            where: { id: existing.id },
            data: { nombre, marca, color, unidadMedidaId: unidadId, stockActual, stockMinimo, costo, precioVenta }
          });
          updatedCount++;
          continue;
        }
      }

      // Create new
      const ultimo = await this.prisma.producto.findFirst({ orderBy: { id: 'desc' } });
      const newCodigo = codigo || `PRO-${String((ultimo?.id || 0) + 1).padStart(6, '0')}`;
      
      await this.prisma.producto.create({
        data: {
          codigoSistema: newCodigo,
          codigo: newCodigo,
          nombre,
          marca,
          color,
          categoriaId: defaultCatId,
          unidadMedidaId: unidadId,
          stockActual,
          stockMinimo,
          costo,
          precioVenta,
          estado: true
        }
      });
      createdCount++;
    }

    return { ok: true, created: createdCount, updated: updatedCount };
  }

  @Put('productos')
  async updateProducto(@Body() data: any) {
    const stockActual = Number(data.stockActual || 0);
    const almacenId = data.almacenId ? Number(data.almacenId) : null;

    const updated = await this.prisma.producto.update({
      where: { id: Number(data.id) },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        marca: data.marca,
        color: data.color,
        categoriaId: Number(data.categoriaId),
        unidadMedidaId: Number(data.unidadMedidaId),
        stockActual: stockActual,
        stockMinimo: Number(data.stockMinimo || 0),
        costo: Number(data.costo || 0),
        precioVenta: Number(data.precioVenta || 0),
      },
    });

    if (almacenId) {
      await this.prisma.stockAlmacen.upsert({
        where: {
          productoId_almacenId: {
            productoId: Number(data.id),
            almacenId: almacenId
          }
        },
        update: {
          stockActual: stockActual
        },
        create: {
          productoId: Number(data.id),
          almacenId: almacenId,
          stockActual: stockActual
        }
      });
    }

    return updated;
  }

  @Delete('productos/:id')
  async deleteProducto(@Param('id') paramId: string) {
    const id = Number(paramId);
    if (isNaN(id)) {
      throw new BadRequestException('ID de producto inválido');
    }
    try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Buscar órdenes de producción vinculadas al producto
        const ordenes = await tx.ordenProduccion.findMany({
          where: { productoFinalId: id },
          select: { id: true },
        });
        const ordenIds = ordenes.map((o) => o.id);

        if (ordenIds.length > 0) {
          // 2. Eliminar sub-relaciones de órdenes de producción
          await tx.archivoProduccion.deleteMany({ where: { ordenProduccionId: { in: ordenIds } } });
          await tx.incidenciaProduccion.deleteMany({ where: { ordenProduccionId: { in: ordenIds } } });
          await tx.controlCalidad.deleteMany({ where: { ordenProduccionId: { in: ordenIds } } });
          await tx.estadoProduccion.deleteMany({ where: { ordenProduccionId: { in: ordenIds } } });
          await tx.kardexProduccion.deleteMany({ where: { ordenProduccionId: { in: ordenIds } } });
          await tx.ordenProduccionTrabajador.deleteMany({ where: { ordenProduccionId: { in: ordenIds } } });
          await tx.lote.deleteMany({ where: { ordenProduccionId: { in: ordenIds } } });
          await tx.consumoMateriaPrima.deleteMany({ where: { ordenProduccionId: { in: ordenIds } } });
          // 3. Eliminar las órdenes de producción
          await tx.ordenProduccion.deleteMany({ where: { productoFinalId: id } });
        }

        // 4. Eliminar consumos de materia prima donde ESTE producto fue la materia prima
        await tx.consumoMateriaPrima.deleteMany({ where: { productoId: id } });

        // 5. Eliminar kardex de producción donde este producto aparece
        await tx.kardexProduccion.deleteMany({ where: { productoId: id } });

        // 6. Eliminar detalles de compra y venta
        await tx.detalleCompra.deleteMany({ where: { productoId: id } });
        await tx.detalleVenta.deleteMany({ where: { productoId: id } });

        // 7. Eliminar stock y movimientos de inventario
        await tx.stockAlmacen.deleteMany({ where: { productoId: id } });
        await tx.movimientoInventario.deleteMany({ where: { productoId: id } });

        // 8. Finalmente, eliminar el producto
        await tx.producto.delete({ where: { id } });
      });
      return { ok: true };
    } catch (error: any) {
      console.error('Error al eliminar producto:', error?.message || error);
      throw new BadRequestException(
        `No se pudo eliminar el producto: ${error?.message || 'Error desconocido'}`,
      );
    }
  }

  @Patch('productos/:id')
  async patchProducto(@Param('id') id: string, @Body() body: any) {
    return this.prisma.producto.update({
      where: { id: Number(id) },
      data: { estado: body.estado },
    });
  }

  // --- MAQUINARIA ---
  @Get('maquinaria')
  async getMaquinaria() {
    return this.prisma.equipo.findMany({
      include: { almacen: true },
      orderBy: { nombre: 'asc' },
    });
  }

  @Post('maquinaria')
  async createMaquinaria(@Body() data: any) {
    const ultimo = await this.prisma.equipo.findFirst({
      orderBy: { id: 'desc' },
    });
    const codigo =
      data.codigo || `MAQ-${String((ultimo?.id || 0) + 1).padStart(4, '0')}`;

    return this.prisma.equipo.create({
      data: {
        codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        ubicacion: data.ubicacion,
        marca: data.marca,
        modelo: data.modelo,
        serie: data.serie || null,
        anioAdquisicion: data.anioAdquisicion ? Number(data.anioAdquisicion) : null,
        costo: Number(data.costo || 0),
        estado: data.estado || 'OPERATIVO',
        almacenId: data.almacenId ? Number(data.almacenId) : null,
      },
    });
  }

  @Put('maquinaria')
  async updateMaquinaria(@Body() data: any) {
    return this.prisma.equipo.update({
      where: { id: Number(data.id) },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        ubicacion: data.ubicacion,
        marca: data.marca,
        modelo: data.modelo,
        serie: data.serie || null,
        anioAdquisicion: data.anioAdquisicion ? Number(data.anioAdquisicion) : null,
        costo: Number(data.costo || 0),
        estado: data.estado,
        almacenId: data.almacenId ? Number(data.almacenId) : null,
      },
    });
  }

  @Delete('maquinaria/:id')
  async deleteMaquinaria(@Param('id') id: string) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.mantenimientoEquipo.deleteMany({ where: { equipoId: Number(id) } });
        await tx.equipo.delete({ where: { id: Number(id) } });
      });
      return { ok: true };
    } catch (error: any) {
      throw new BadRequestException('No se puede eliminar la maquinaria.');
    }
  }

  @Patch('maquinaria/:id')
  async patchMaquinaria(@Param('id') id: string, @Body() body: any) {
    return this.prisma.equipo.update({
      where: { id: Number(id) },
      data: { estado: body.estado },
    });
  }

  // --- SINCRONIZAR STOCKS (producto = suma de almacenes) ---
  @Patch('sync-stocks')
  async syncStocks() {
    // 1. Corregir stocks negativos en almacén
    await this.prisma.stockAlmacen.updateMany({
      where: { stockActual: { lt: 0 } },
      data: { stockActual: 0 },
    });

    // 2. Recalcular producto.stockActual = SUM(stockAlmacen.stockActual)
    const productos = await this.prisma.producto.findMany({
      include: { StockAlmacen: true },
    });

    for (const prod of productos) {
      const totalStock = prod.StockAlmacen.reduce(
        (sum: number, sa: any) => sum + Math.max(0, Number(sa.stockActual)),
        0,
      );
      await this.prisma.producto.update({
        where: { id: prod.id },
        data: { stockActual: totalStock },
      });
    }

    return { ok: true, message: `Stocks sincronizados: ${productos.length} productos actualizados` };
  }
}
