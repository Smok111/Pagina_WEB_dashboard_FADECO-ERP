import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';

@Controller('api/maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get('equipos')
  getEquipos() { return this.maintenanceService.getEquipos(); }

  @Post('equipos')
  createEquipo(@Body() data: any) { return this.maintenanceService.createEquipo(data); }

  @Get('mantenimientos')
  getMantenimientos() { return this.maintenanceService.getMantenimientos(); }

  @Post('mantenimientos')
  createMantenimiento(@Body() data: any) { return this.maintenanceService.createMantenimiento(data); }

  @Patch('mantenimientos/:id/finish')
  finishMantenimiento(@Param('id') id: string, @Body() data: any) {
    return this.maintenanceService.finishMantenimiento(+id, data);
  }
}
