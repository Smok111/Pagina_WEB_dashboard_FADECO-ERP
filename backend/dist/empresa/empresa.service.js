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
exports.EmpresaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EmpresaService = class EmpresaService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEmpresa() {
        return this.prisma.empresa.findFirst();
    }
    async upsertEmpresa(data) {
        const empresa = await this.prisma.empresa.findFirst();
        const updateData = {
            ruc: data.ruc,
            razonSocial: data.razonSocial,
            direccion: data.direccion,
            telefono: data.telefono,
            correo: data.correo,
            moneda: data.moneda,
            igv: data.igv,
        };
        if (empresa) {
            return this.prisma.empresa.update({
                where: { id: empresa.id },
                data: updateData,
            });
        }
        else {
            return this.prisma.empresa.create({
                data: updateData,
            });
        }
    }
};
exports.EmpresaService = EmpresaService;
exports.EmpresaService = EmpresaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmpresaService);
//# sourceMappingURL=empresa.service.js.map