import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller('api/sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @Get('clientes')
  getClientes() {
    return this.salesService.getClientes();
  }

  @Post('clientes')
  createCliente(@Body() data: any) {
    return this.salesService.createCliente(data);
  }

  @Post()
  create(@Body() data: any, @Req() req: any) {
    const userId = req.user?.id || 1;
    return this.salesService.create(data, userId);
  }
}
