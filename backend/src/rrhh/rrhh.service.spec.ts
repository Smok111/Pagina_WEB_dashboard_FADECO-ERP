import { PrismaService } from '../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { RrhhService } from './rrhh.service';

const mockPrismaService = {};

describe('RrhhService', () => {
  let service: RrhhService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RrhhService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<RrhhService>(RrhhService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
