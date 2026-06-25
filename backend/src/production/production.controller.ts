import { Controller, Get, Post, Body, Param, Patch, Req } from '@nestjs/common';
import { ProductionService } from './production.service';

@Controller('api/production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get()
  findAll() {
    return this.productionService.findAll();
  }

  @Post()
  create(@Body() data: any) {
    return this.productionService.create(data);
  }

  @Patch(':id/start')
  start(@Param('id') id: string) {
    return this.productionService.start(+id);
  }

  @Post(':id/consumos')
  addConsumo(@Param('id') id: string, @Body() data: any) {
    return this.productionService.addConsumo(+id, data);
  }

  @Patch(':id/finish')
  finish(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const userId = req.user?.id || 1; // From JWT
    return this.productionService.finish(+id, data, userId);
  }
}
