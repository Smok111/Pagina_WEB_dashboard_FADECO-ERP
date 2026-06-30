import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { InventoryController } from './inventory/inventory.controller';
import { PurchasesController } from './purchases/purchases.controller';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { SalesModule } from './sales/sales.module';
import { ProductionModule } from './production/production.module';
import { RrhhModule } from './rrhh/rrhh.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmpresaModule } from './empresa/empresa.module';
import { StorageModule } from './storage/storage.module';


@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RolesModule,
    UsersModule,
    SalesModule,
    ProductionModule,
    RrhhModule,
    MaintenanceModule,
    DashboardModule,
    EmpresaModule,
    StorageModule,
  ],
  controllers: [AppController, InventoryController, PurchasesController],
  providers: [AppService],
})
export class AppModule {}
