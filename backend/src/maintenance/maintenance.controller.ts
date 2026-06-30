import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';

@Controller('api/maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get('equipos')
  getEquipos() {
    return this.maintenanceService.getEquipos();
  }

  @Post('equipos')
  createEquipo(@Body() data: any) {
    return this.maintenanceService.createEquipo(data);
  }

  @Get('mantenimientos')
  getMantenimientos() {
    return this.maintenanceService.getMantenimientos();
  }

  @Post('mantenimientos')
  createMantenimiento(@Body() data: any) {
    return this.maintenanceService.createMantenimiento(data);
  }

  @Patch('mantenimientos/:id/finish')
  finishMantenimiento(@Param('id') id: string, @Body() data: any) {
    return this.maintenanceService.finishMantenimiento(+id, data);
  }

  @Delete('equipos/:id')
  deleteEquipo(@Param('id') id: string) {
    return this.maintenanceService.deleteEquipo(+id);
  }

  @Delete('mantenimientos/:id')
  deleteMantenimiento(@Param('id') id: string) {
    return this.maintenanceService.deleteMantenimiento(+id);
  }
}
