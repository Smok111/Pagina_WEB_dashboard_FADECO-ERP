import { Controller, Get, Post, Body } from '@nestjs/common';
import { RrhhService } from './rrhh.service';

@Controller('api/rrhh')
export class RrhhController {
  constructor(private readonly rrhhService: RrhhService) {}

  @Get('areas')
  getAreas() {
    return this.rrhhService.getAreas();
  }

  @Get('cargos')
  getCargos() {
    return this.rrhhService.getCargos();
  }

  @Get('trabajadores')
  getTrabajadores() {
    return this.rrhhService.getTrabajadores();
  }

  @Post('trabajadores')
  createTrabajador(@Body() data: any) {
    return this.rrhhService.createTrabajador(data);
  }

  @Post('areas')
  createArea(@Body() data: any) {
    return this.rrhhService.createArea(data);
  }

  @Post('cargos')
  createCargo(@Body() data: any) {
    return this.rrhhService.createCargo(data);
  }
}
