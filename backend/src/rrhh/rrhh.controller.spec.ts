import { Test, TestingModule } from '@nestjs/testing';
import { RrhhController } from './rrhh.controller';

describe('RrhhController', () => {
  let controller: RrhhController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RrhhController],
    }).compile();

    controller = module.get<RrhhController>(RrhhController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
