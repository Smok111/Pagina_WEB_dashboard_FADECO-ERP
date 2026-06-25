"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const inventory_controller_1 = require("./inventory/inventory.controller");
const purchases_controller_1 = require("./purchases/purchases.controller");
const roles_module_1 = require("./roles/roles.module");
const users_module_1 = require("./users/users.module");
const sales_module_1 = require("./sales/sales.module");
const production_module_1 = require("./production/production.module");
const rrhh_module_1 = require("./rrhh/rrhh.module");
const maintenance_module_1 = require("./maintenance/maintenance.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const empresa_module_1 = require("./empresa/empresa.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            roles_module_1.RolesModule,
            users_module_1.UsersModule,
            sales_module_1.SalesModule,
            production_module_1.ProductionModule,
            rrhh_module_1.RrhhModule,
            maintenance_module_1.MaintenanceModule,
            dashboard_module_1.DashboardModule,
            empresa_module_1.EmpresaModule,
        ],
        controllers: [app_controller_1.AppController, inventory_controller_1.InventoryController, purchases_controller_1.PurchasesController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map