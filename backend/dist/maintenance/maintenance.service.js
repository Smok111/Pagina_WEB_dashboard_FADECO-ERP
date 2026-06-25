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
exports.MaintenanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MaintenanceService = class MaintenanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEquipos() {
        return this.prisma.equipo.findMany({
            include: {
                mantenimientos: { orderBy: { fechaProgramada: 'desc' }, take: 1 },
            },
        });
    }
    async createEquipo(data) {
        const ultimo = await this.prisma.equipo.findFirst({
            orderBy: { id: 'desc' },
        });
        const codigo = data.codigo || `EQP-${String((ultimo?.id || 0) + 1).padStart(4, '0')}`;
        return this.prisma.equipo.create({
            data: {
                codigo,
                nombre: data.nombre,
                ubicacion: data.ubicacion,
            },
        });
    }
    async getMantenimientos() {
        return this.prisma.mantenimientoEquipo.findMany({
            include: { equipo: true },
            orderBy: { fechaProgramada: 'desc' },
        });
    }
    async createMantenimiento(data) {
        return this.prisma.mantenimientoEquipo.create({
            data: {
                equipoId: Number(data.equipoId),
                tipo: data.tipo,
                fechaProgramada: new Date(data.fechaProgramada),
                detalles: data.detalles,
                estado: 'PROGRAMADO',
            },
        });
    }
    async finishMantenimiento(id, data) {
        return this.prisma.$transaction(async (tx) => {
            const mant = await tx.mantenimientoEquipo.update({
                where: { id },
                data: {
                    estado: 'COMPLETADO',
                    fechaRealizacion: new Date(),
                    costo: Number(data.costo || 0),
                    detalles: data.detalles || undefined,
                },
            });
            await tx.equipo.update({
                where: { id: mant.equipoId },
                data: { estado: 'OPERATIVO' },
            });
            return mant;
        });
    }
};
exports.MaintenanceService = MaintenanceService;
exports.MaintenanceService = MaintenanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaintenanceService);
//# sourceMappingURL=maintenance.service.js.map