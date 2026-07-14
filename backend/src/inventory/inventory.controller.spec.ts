import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('InventoryController', () => {
  let controller: InventoryController;
  let prisma: PrismaService;

  const mockPrismaService = {
    almacen: {
      findUnique: jest.fn(),
    },
    producto: {
      findMany: jest.fn(),
    },
    stockAlmacen: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAlmacen', () => {
    it('should return null if warehouse not found', async () => {
      mockPrismaService.almacen.findUnique.mockResolvedValue(null);

      const result = await controller.getAlmacen('1');
      expect(result).toBeNull();
    });

    it('should return empty stocks for Maquinaria warehouse', async () => {
      const mockAlmacen = {
        id: 3,
        codigo: 'ALM-003',
        nombre: 'Almacén de Maquinaria',
        equipos: [{ id: 10, nombre: 'Tractor Test A', almacenId: 3 }],
      };

      mockPrismaService.almacen.findUnique.mockResolvedValue(mockAlmacen);

      const result = await controller.getAlmacen('3');

      expect(result).toBeDefined();
      expect(result.id).toBe(3);
      expect(result.stocks).toHaveLength(0);
      expect(result.equipos).toHaveLength(1);
      // No debe consultar stockAlmacen para almacén de maquinaria
      expect(mockPrismaService.stockAlmacen.findMany).not.toHaveBeenCalled();
    });

    it('should return only products with stock records for non-maquinaria warehouses', async () => {
      const mockAlmacen = {
        id: 2,
        codigo: 'ALM-001',
        nombre: 'Almacén de Producción',
        equipos: [],
      };

      const mockStocksReales = [
        {
          id: 501,
          productoId: 101,
          almacenId: 2,
          stockActual: 15,
          producto: { id: 101, nombre: 'Producto A', codigo: 'PROD-A', categoria: null, unidadMedida: null },
        },
      ];

      mockPrismaService.almacen.findUnique.mockResolvedValue(mockAlmacen);
      mockPrismaService.stockAlmacen.findMany.mockResolvedValue(mockStocksReales);

      const result = await controller.getAlmacen('2');

      expect(result).toBeDefined();
      expect(result.id).toBe(2);
      // Solo debe devolver 1 producto (el que tiene stock), no todos los del sistema
      expect(result.stocks).toHaveLength(1);
      expect(result.stocks[0].productoId).toBe(101);
      expect(result.stocks[0].stockActual).toBe(15);
    });
  });
});
