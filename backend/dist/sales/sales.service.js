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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SalesService = class SalesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.venta.findMany({
            include: { cliente: true, usuario: true, detalles: { include: { producto: true } } },
            orderBy: { fecha: 'desc' },
        });
    }
    async getClientes() {
        return this.prisma.cliente.findMany();
    }
    async create(data, userId = 1) {
        const ultima = await this.prisma.venta.findFirst({ orderBy: { id: 'desc' } });
        const codigoSistema = `VEN-${String((ultima?.id || 0) + 1).padStart(6, '0')}`;
        return this.prisma.$transaction(async (tx) => {
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
            if (venta.estado === 'COMPLETADA') {
                for (const detalle of venta.detalles) {
                    const almacenId = 1;
                    await tx.movimientoInventario.create({
                        data: {
                            tipo: 'SALIDA',
                            cantidad: detalle.cantidad,
                            observacion: `Salida por venta ${venta.codigoSistema}`,
                            productoId: detalle.productoId,
                            almacenId,
                        },
                    });
                    const stock = await tx.stockAlmacen.findUnique({
                        where: { productoId_almacenId: { productoId: detalle.productoId, almacenId } },
                    });
                    if (stock && stock.stockActual >= detalle.cantidad) {
                        await tx.stockAlmacen.update({
                            where: { id: stock.id },
                            data: { stockActual: { decrement: detalle.cantidad } },
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
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalesService);
//# sourceMappingURL=sales.service.js.map