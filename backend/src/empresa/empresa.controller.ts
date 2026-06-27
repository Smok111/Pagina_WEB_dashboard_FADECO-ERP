import { Controller, Get, Put, Body } from '@nestjs/common';
import { EmpresaService } from './empresa.service';

@Controller('api/empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Get()
  async getEmpresa() {
    const empresa = await this.empresaService.getEmpresa();
    return empresa || {};
  }

  @Put()
  async upsertEmpresa(@Body() data: any) {
    return this.empresaService.upsertEmpresa(data);
  }
}
