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
exports.RrhhService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RrhhService = class RrhhService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAreas() {
        return this.prisma.area.findMany();
    }
    async getCargos() {
        return this.prisma.cargo.findMany();
    }
    async getTrabajadores() {
        return this.prisma.trabajador.findMany({
            include: { area: true, cargo: true },
        });
    }
    async createTrabajador(data) {
        return this.prisma.trabajador.create({
            data: {
                dni: data.dni,
                nombres: data.nombres,
                apellidos: data.apellidos,
                fechaIngreso: new Date(data.fechaIngreso),
                areaId: Number(data.areaId),
                cargoId: Number(data.cargoId),
                salarioBase: Number(data.salarioBase),
            },
        });
    }
    async createArea(data) {
        return this.prisma.area.create({
            data: { nombre: data.nombre, descripcion: data.descripcion },
        });
    }
    async createCargo(data) {
        return this.prisma.cargo.create({
            data: { nombre: data.nombre, descripcion: data.descripcion },
        });
    }
};
exports.RrhhService = RrhhService;
exports.RrhhService = RrhhService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RrhhService);
//# sourceMappingURL=rrhh.service.js.map