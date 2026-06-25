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
exports.MaintenanceController = void 0;
const common_1 = require("@nestjs/common");
const maintenance_service_1 = require("./maintenance.service");
let MaintenanceController = class MaintenanceController {
    maintenanceService;
    constructor(maintenanceService) {
        this.maintenanceService = maintenanceService;
    }
    getEquipos() {
        return this.maintenanceService.getEquipos();
    }
    createEquipo(data) {
        return this.maintenanceService.createEquipo(data);
    }
    getMantenimientos() {
        return this.maintenanceService.getMantenimientos();
    }
    createMantenimiento(data) {
        return this.maintenanceService.createMantenimiento(data);
    }
    finishMantenimiento(id, data) {
        return this.maintenanceService.finishMantenimiento(+id, data);
    }
};
exports.MaintenanceController = MaintenanceController;
__decorate([
    (0, common_1.Get)('equipos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "getEquipos", null);
__decorate([
    (0, common_1.Post)('equipos'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "createEquipo", null);
__decorate([
    (0, common_1.Get)('mantenimientos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "getMantenimientos", null);
__decorate([
    (0, common_1.Post)('mantenimientos'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "createMantenimiento", null);
__decorate([
    (0, common_1.Patch)('mantenimientos/:id/finish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "finishMantenimiento", null);
exports.MaintenanceController = MaintenanceController = __decorate([
    (0, common_1.Controller)('api/maintenance'),
    __metadata("design:paramtypes", [maintenance_service_1.MaintenanceService])
], MaintenanceController);
//# sourceMappingURL=maintenance.controller.js.map