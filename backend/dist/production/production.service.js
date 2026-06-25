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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductionService = class ProductionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.ordenProduccion.findMany({
            include: {
                productoFinal: true,
                consumos: { include: { producto: true } },
                lotes: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(data) {
        const ultima = await this.prisma.ordenProduccion.findFirst({
            orderBy: { id: 'desc' },
        });
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
    async start(id) {
        return this.prisma.ordenProduccion.update({
            where: { id },
            data: { estado: 'EN_PROCESO' },
        });
    }
    async addConsumo(opId, data) {
        return this.prisma.$transaction(async (tx) => {
            const consumo = await tx.consumoMateriaPrima.create({
                data: {
                    ordenProduccionId: opId,
                    productoId: Number(data.productoId),
                    cantidad: Number(data.cantidad),
                    almacenId: Number(data.almacenId || 1),
                },
            });
            await tx.movimientoInventario.create({
                data: {
                    tipo: 'SALIDA',
                    cantidad: consumo.cantidad,
                    observacion: `Consumo para OP-${opId}`,
                    productoId: consumo.productoId,
                    almacenId: consumo.almacenId,
                },
            });
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
    async finish(id, data, userId) {
        return this.prisma.$transaction(async (tx) => {
            const op = await tx.ordenProduccion.update({
                where: { id },
                data: {
                    estado: 'FINALIZADA',
                    cantidadReal: Number(data.cantidadReal),
                    fechaFin: new Date(),
                },
                include: { productoFinal: true },
            });
            const numeroLote = `LOT-${op.codigoOP}-${Date.now().toString().slice(-4)}`;
            const lote = await tx.lote.create({
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
                    cantidad: op.cantidadReal,
                    observacion: `Producción finalizada ${op.codigoOP} (Lote: ${numeroLote})`,
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
                    data: { stockActual: { increment: op.cantidadReal } },
                });
            }
            else {
                await tx.stockAlmacen.create({
                    data: {
                        productoId: op.productoFinalId,
                        almacenId,
                        stockActual: op.cantidadReal,
                    },
                });
            }
            await tx.producto.update({
                where: { id: op.productoFinalId },
                data: { stockActual: { increment: op.cantidadReal } },
            });
            return op;
        });
    }
};
exports.ProductionService = ProductionService;
exports.ProductionService = ProductionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductionService);
//# sourceMappingURL=production.service.js.map