"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.usuario.findMany({
            select: {
                id: true,
                nombres: true,
                apellidos: true,
                email: true,
                activo: true,
                rolId: true,
                sucursalId: true,
                rol: true,
                sucursal: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async findOne(id) {
        return this.prisma.usuario.findUnique({
            where: { id },
            include: { rol: true, sucursal: true },
        });
    }
    async create(data) {
        const passwordHash = await bcrypt.hash(data.password || '123456', 10);
        return this.prisma.usuario.create({
            data: {
                nombres: data.nombres,
                apellidos: data.apellidos,
                email: data.email,
                passwordHash,
                rolId: Number(data.rolId),
                sucursalId: Number(data.sucursalId || 1),
                activo: data.activo ?? true,
            },
        });
    }
    async update(id, data) {
        const updateData = { ...data };
        if (data.password) {
            updateData.passwordHash = await bcrypt.hash(data.password, 10);
        }
        delete updateData.password;
        if (data.rolId)
            updateData.rolId = Number(data.rolId);
        if (data.sucursalId)
            updateData.sucursalId = Number(data.sucursalId);
        return this.prisma.usuario.update({
            where: { id },
            data: updateData,
        });
    }
    async remove(id) {
        return this.prisma.usuario.delete({ where: { id } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map