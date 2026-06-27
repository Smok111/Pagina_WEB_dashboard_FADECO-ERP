import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, Delete, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Delete('trabajadores/:id')
  deleteTrabajador(@Param('id') id: string) {
    return this.rrhhService.deleteTrabajador(Number(id));
  }
  @Post('trabajadores/import')
  @UseInterceptors(FileInterceptor('file'))
  importWorkers(@UploadedFile() file: Express.Multer.File) {
    return this.rrhhService.importWorkers(file);
  }

  @Post('areas')
  createArea(@Body() data: any) {
    return this.rrhhService.createArea(data);
  }

  @Post('cargos')
  createCargo(@Body() data: any) {
    return this.rrhhService.createCargo(data);
  }

  @Get('areas-produccion')
  getAreasProduccion() {
    return this.rrhhService.getAreasProduccion();
  }

  @Post('areas-produccion')
  createAreaProduccion(@Body() data: any) {
    return this.rrhhService.createAreaProduccion(data);
  }
}
