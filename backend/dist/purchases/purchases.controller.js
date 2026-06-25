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
exports.PurchasesController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PurchasesController = class PurchasesController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPurchases() {
        return this.prisma.compra.findMany({
            include: { proveedor: true, almacen: true, detalles: { include: { producto: true } } },
            orderBy: { fecha: 'desc' },
        });
    }
    async getProveedores() {
        return this.prisma.proveedor.findMany();
    }
    async createPurchase(data) {
        const ultima = await this.prisma.compra.findFirst({ orderBy: { id: 'desc' } });
        const codigoSistema = `COM-${String((ultima?.id || 0) + 1).padStart(6, '0')}`;
        return this.prisma.$transaction(async (tx) => {
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
                        create: data.detalles.map((d) => ({
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
                    }
                    else {
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
};
exports.PurchasesController = PurchasesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PurchasesController.prototype, "getPurchases", null);
__decorate([
    (0, common_1.Get)('proveedores'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PurchasesController.prototype, "getProveedores", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PurchasesController.prototype, "createPurchase", null);
exports.PurchasesController = PurchasesController = __decorate([
    (0, common_1.Controller)('api/purchases'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchasesController);
//# sourceMappingURL=purchases.controller.js.map