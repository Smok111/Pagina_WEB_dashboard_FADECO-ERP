"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InventoryController = class InventoryController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCategorias() {
        return this.prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
    }
    async createCategoria(data) {
        const ultimo = await this.prisma.categoria.findFirst({ orderBy: { id: 'desc' } });
        const codigo = data.codigo || `CAT-${String((ultimo?.id || 0) + 1).padStart(3, '0')}`;
        return this.prisma.categoria.create({
            data: {
                codigo,
                nombre: data.nombre,
                descripcion: data.descripcion,
            },
        });
    }
    async updateCategoria(data) {
        return this.prisma.categoria.update({
            where: { id: Number(data.id) },
            data: {
                codigo: data.codigo,
                nombre: data.nombre,
                descripcion: data.descripcion,
            },
        });
    }
    async deleteCategoria(body) {
        await this.prisma.categoria.delete({ where: { id: Number(body.id) } });
        return { ok: true };
    }
    async getUnidades() {
        return this.prisma.unidadMedida.findMany({ orderBy: { nombre: 'asc' } });
    }
    async createUnidad(data) {
        return this.prisma.unidadMedida.create({
            data: {
                codigo: data.codigo || data.nombre.substring(0, 3).toUpperCase(),
                nombre: data.nombre,
            },
        });
    }
    async updateUnidad(data) {
        return this.prisma.unidadMedida.update({
            where: { id: Number(data.id) },
            data: { codigo: data.codigo, nombre: data.nombre },
        });
    }
    async deleteUnidad(body) {
        await this.prisma.unidadMedida.delete({ where: { id: Number(body.id) } });
        return { ok: true };
    }
    async getAlmacenes() {
        return this.prisma.almacen.findMany({ orderBy: { nombre: 'asc' } });
    }
    async getAlmacen(id) {
        return this.prisma.almacen.findUnique({
            where: { id: Number(id) },
            include: { stocks: { include: { producto: true } } },
        });
    }
    async createAlmacen(data) {
        const ultimo = await this.prisma.almacen.findFirst({ orderBy: { id: 'desc' } });
        const codigo = data.codigo || `ALM-${String((ultimo?.id || 0) + 1).padStart(3, '0')}`;
        return this.prisma.almacen.create({
            data: { codigo, nombre: data.nombre, ubicacion: data.ubicacion },
        });
    }
    async updateAlmacen(data) {
        return this.prisma.almacen.update({
            where: { id: Number(data.id) },
            data: { codigo: data.codigo, nombre: data.nombre, ubicacion: data.ubicacion },
        });
    }
    async deleteAlmacen(body) {
        await this.prisma.almacen.delete({ where: { id: Number(body.id) } });
        return { ok: true };
    }
    async getProductos() {
        return this.prisma.producto.findMany({
            include: { categoria: true, unidadMedida: true },
            orderBy: { nombre: 'asc' },
        });
    }
    async createProducto(data) {
        const ultimo = await this.prisma.producto.findFirst({ orderBy: { id: 'desc' } });
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
    async getKardex(id) {
        const movimientos = await this.prisma.movimientoInventario.findMany({
            where: { productoId: Number(id) },
            orderBy: { fecha: 'asc' },
            include: { almacen: true }
        });
        let saldo = 0;
        const kardex = movimientos.map(m => {
            const cant = Number(m.cantidad);
            if (m.tipo === 'INGRESO')
                saldo += cant;
            if (m.tipo === 'SALIDA')
                saldo -= cant;
            return {
                ...m,
                cantidad: cant,
                saldo
            };
        });
        return kardex.reverse();
    }
    async importProductos(data) {
        const ultimo = await this.prisma.producto.findFirst({ orderBy: { id: 'desc' } });
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
    async updateProducto(data) {
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
    async deleteProducto(body) {
        await this.prisma.producto.delete({ where: { id: Number(body.id) } });
        return { ok: true };
    }
    async patchProducto(id, body) {
        return this.prisma.producto.update({
            where: { id: Number(id) },
            data: { estado: body.estado },
        });
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)('categorias'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getCategorias", null);
__decorate([
    (0, common_1.Post)('categorias'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createCategoria", null);
__decorate([
    (0, common_1.Put)('categorias'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateCategoria", null);
__decorate([
    (0, common_1.Delete)('categorias'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "deleteCategoria", null);
__decorate([
    (0, common_1.Get)('unidades-medida'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getUnidades", null);
__decorate([
    (0, common_1.Post)('unidades-medida'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createUnidad", null);
__decorate([
    (0, common_1.Put)('unidades-medida'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateUnidad", null);
__decorate([
    (0, common_1.Delete)('unidades-medida'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "deleteUnidad", null);
__decorate([
    (0, common_1.Get)('almacenes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getAlmacenes", null);
__decorate([
    (0, common_1.Get)('almacenes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getAlmacen", null);
__decorate([
    (0, common_1.Post)('almacenes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createAlmacen", null);
__decorate([
    (0, common_1.Put)('almacenes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateAlmacen", null);
__decorate([
    (0, common_1.Delete)('almacenes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "deleteAlmacen", null);
__decorate([
    (0, common_1.Get)('productos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getProductos", null);
__decorate([
    (0, common_1.Post)('productos'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createProducto", null);
__decorate([
    (0, common_1.Get)('productos/:id/kardex'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getKardex", null);
__decorate([
    (0, common_1.Post)('productos/import'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "importProductos", null);
__decorate([
    (0, common_1.Put)('productos'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateProducto", null);
__decorate([
    (0, common_1.Delete)('productos'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "deleteProducto", null);
__decorate([
    (0, common_1.Patch)('productos/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "patchProducto", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)('api/inventory'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map