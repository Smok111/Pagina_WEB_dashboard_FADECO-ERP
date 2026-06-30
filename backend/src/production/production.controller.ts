import { Controller, Get, Post, Body, Param, Patch, Req, UseInterceptors, UploadedFile, BadRequestException, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductionService } from './production.service';

@Controller('api/production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get()
  findAll() {
    return this.productionService.findAll();
  }

  @Post()
  create(@Body() data: any, @Req() req: any) {
    const userId = req.user?.id || 1;
    return this.productionService.create(data, userId);
  }

  @Patch(':id/start')
  start(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 1;
    return this.productionService.start(+id, userId);
  }

  @Post(':id/assign-workers')
  assignWorkers(@Param('id') id: string, @Body() data: any) {
    return this.productionService.assignWorkers(+id, data);
  }

  @Post(':id/quality')
  addQualityControl(@Param('id') id: string, @Body() data: any) {
    return this.productionService.addQualityControl(+id, data);
  }

  @Post(':id/issues')
  addIssue(@Param('id') id: string, @Body() data: any) {
    return this.productionService.addIssue(+id, data);
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

  @Post(':id/archivos')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.productionService.addFile(+id, file);
  }

  @Delete(':id/archivos/:archivoId')
  async deleteFile(@Param('archivoId') archivoId: string) {
    return this.productionService.deleteFile(+archivoId);
  }

  @Delete(':id')
  async deleteOP(@Param('id') id: string) {
    return this.productionService.delete(+id);
  }
}

