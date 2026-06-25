import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Patch,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/inventory')
export class InventoryController {
  constructor(private prisma: PrismaService) {}

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

  @Delete('categorias')
  async deleteCategoria(@Body() body: any) {
    await this.prisma.categoria.delete({ where: { id: Number(body.id) } });
    return { ok: true };
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

  @Delete('unidades-medida')
  async deleteUnidad(@Body() body: any) {
    await this.prisma.unidadMedida.delete({ where: { id: Number(body.id) } });
    return { ok: true };
  }

  // --- ALMACENES ---
  @Get('almacenes')
  async getAlmacenes() {
    return this.prisma.almacen.findMany({ orderBy: { nombre: 'asc' } });
  }

  @Get('almacenes/:id')
  async getAlmacen(@Param('id') id: string) {
    return this.prisma.almacen.findUnique({
      where: { id: Number(id) },
      include: { stocks: { include: { producto: true } } },
    });
  }

  @Post('almacenes')
  async createAlmacen(@Body() data: any) {
    const ultimo = await this.prisma.almacen.findFirst({
      orderBy: { id: 'desc' },
    });
    const codigo =
      data.codigo || `ALM-${String((ultimo?.id || 0) + 1).padStart(3, '0')}`;
    return this.prisma.almacen.create({
      data: { codigo, nombre: data.nombre, ubicacion: data.ubicacion },
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
      },
    });
  }

  @Delete('almacenes')
  async deleteAlmacen(@Body() body: any) {
    await this.prisma.almacen.delete({ where: { id: Number(body.id) } });
    return { ok: true };
  }

  // --- PRODUCTOS ---
  @Get('productos')
  async getProductos() {
    return this.prisma.producto.findMany({
      include: { categoria: true, unidadMedida: true },
      orderBy: { nombre: 'asc' },
    });
  }

  @Post('productos')
  async createProducto(@Body() data: any) {
    const ultimo = await this.prisma.producto.findFirst({
      orderBy: { id: 'desc' },
    });
    const codigoSistema = `PRO-${String((ultimo?.id || 0) + 1).padStart(6, '0')}`;
    return this.prisma.producto.create({
      data: {
        codigoSistema,
        codigo: codigoSistema,
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoriaId: Number(data.categoriaId),
        unidadMedidaId: Number(data.unidadMedidaId),
        stockActual: Number(data.stockActual || 0),
        stockMinimo: Number(data.stockMinimo || 0),
        costo: Number(data.costo || 0),
        precioVenta: Number(data.precioVenta || 0),
        estado: true,
      },
    });
  }

  @Get('productos/:id/kardex')
  async getKardex(@Param('id') id: string) {
    const movimientos = await this.prisma.movimientoInventario.findMany({
      where: { productoId: Number(id) },
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
    const ultimo = await this.prisma.producto.findFirst({
      orderBy: { id: 'desc' },
    });
    let lastId = ultimo?.id || 0;

    const firstCat = await this.prisma.categoria.findFirst();
    const firstUni = await this.prisma.unidadMedida.findFirst();
    const defaultCatId = firstCat?.id || 1;
    const defaultUniId = firstUni?.id || 1;

    const productosAInsertar = data.map((item) => {
      lastId++;
      const codigoSistema = `PRO-${String(lastId).padStart(6, '0')}`;
      return {
        codigoSistema,
        codigo: codigoSistema,
        nombre: item.nombre || 'Producto Importado',
        descripcion: item.descripcion || '',
        categoriaId: Number(item.categoriaId) || defaultCatId,
        unidadMedidaId: Number(item.unidadMedidaId) || defaultUniId,
        stockActual: Number(item.stockActual || 0),
        stockMinimo: Number(item.stockMinimo || 0),
        costo: Number(item.costo || 0),
        precioVenta: Number(item.precioVenta || 0),
        estado: true,
      };
    });

    await this.prisma.producto.createMany({
      data: productosAInsertar,
    });

    return { ok: true, count: productosAInsertar.length };
  }

  @Put('productos')
  async updateProducto(@Body() data: any) {
    return this.prisma.producto.update({
      where: { id: Number(data.id) },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoriaId: Number(data.categoriaId),
        unidadMedidaId: Number(data.unidadMedidaId),
        stockActual: Number(data.stockActual || 0),
        stockMinimo: Number(data.stockMinimo || 0),
        costo: Number(data.costo || 0),
        precioVenta: Number(data.precioVenta || 0),
      },
    });
  }

  @Delete('productos')
  async deleteProducto(@Body() body: any) {
    await this.prisma.producto.delete({ where: { id: Number(body.id) } });
    return { ok: true };
  }

  @Patch('productos/:id')
  async patchProducto(@Param('id') id: string, @Body() body: any) {
    return this.prisma.producto.update({
      where: { id: Number(id) },
      data: { estado: body.estado },
    });
  }
}
