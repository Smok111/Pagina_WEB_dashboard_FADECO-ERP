import { RrhhService } from './rrhh.service';
import { PrismaService } from '../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { RrhhController } from './rrhh.controller';

const mockPrismaService = {};

describe('RrhhController', () => {
  let controller: RrhhController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RrhhController],
      providers: [RrhhService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    controller = module.get<RrhhController>(RrhhController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
