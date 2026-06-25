import { Test, TestingModule } from '@nestjs/testing';
import { RrhhService } from './rrhh.service';

describe('RrhhService', () => {
  let service: RrhhService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RrhhService],
    }).compile();

    service = module.get<RrhhService>(RrhhService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
