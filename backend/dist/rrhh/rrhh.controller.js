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
exports.RrhhController = void 0;
const common_1 = require("@nestjs/common");
const rrhh_service_1 = require("./rrhh.service");
let RrhhController = class RrhhController {
    rrhhService;
    constructor(rrhhService) {
        this.rrhhService = rrhhService;
    }
    getAreas() {
        return this.rrhhService.getAreas();
    }
    getCargos() {
        return this.rrhhService.getCargos();
    }
    getTrabajadores() {
        return this.rrhhService.getTrabajadores();
    }
    createTrabajador(data) {
        return this.rrhhService.createTrabajador(data);
    }
    createArea(data) {
        return this.rrhhService.createArea(data);
    }
    createCargo(data) {
        return this.rrhhService.createCargo(data);
    }
};
exports.RrhhController = RrhhController;
__decorate([
    (0, common_1.Get)('areas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RrhhController.prototype, "getAreas", null);
__decorate([
    (0, common_1.Get)('cargos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RrhhController.prototype, "getCargos", null);
__decorate([
    (0, common_1.Get)('trabajadores'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RrhhController.prototype, "getTrabajadores", null);
__decorate([
    (0, common_1.Post)('trabajadores'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RrhhController.prototype, "createTrabajador", null);
__decorate([
    (0, common_1.Post)('areas'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RrhhController.prototype, "createArea", null);
__decorate([
    (0, common_1.Post)('cargos'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RrhhController.prototype, "createCargo", null);
exports.RrhhController = RrhhController = __decorate([
    (0, common_1.Controller)('api/rrhh'),
    __metadata("design:paramtypes", [rrhh_service_1.RrhhService])
], RrhhController);
//# sourceMappingURL=rrhh.controller.js.map